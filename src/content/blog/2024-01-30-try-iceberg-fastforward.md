---
title: 'Try Iceberg FastForward Procedure'
description: 'Try running Iceberg fast_foward procedure with its branching feature'
pubDate: 'Jan. 30 2024'
heroImage: '/blog/2024-01-30.png'
tags: ['iceberg']
---

From Iceberg 1.4.0, the `fast_forward` procedure is supported (see the [release note](https://iceberg.apache.org/releases/#140-release)). Using the procedure with the branching feature, you can check your table records before  publishing records to data consumers. Through this post, we look when and how to run the procedure.

## Scenario

Go through the following steps. The Iceberg configuration for spark is described in Appendix 1 at the bottom.

1. Create an Iceberg table with sample records
2. Create a branch `audit` based on the current table records
3. Switch the current branch `main` to `audit` and add records into the Iceberg table
4. Review the records in `audit`
5. Run FastForward

## 1. Create an Iceberg table with sample records

Initially create an Iceberg table via CTAS.

```scala
val location = "s3://bucket/path"

spark.sql(s"""
CREATE TABLE hive_catalog.db.tbl
USING iceberg 
LOCATION '$location'
PARTITIONED BY (dt)
AS SELECT id, name, dt FROM VALUES
	(1, 'tom', '2024-01-28'), (2, 'tan', '2024-01-29'), (3, 'dev', '2024-01-29') AS rec(id, name, dt)
""")


spark.sql(s"SELECT * FROM hive_catalog.db.tbl").show(false)
/*
+---+----+----------+
|id |name|dt        |
+---+----+----------+
|3  |dev |2024-01-29|
|2  |tan |2024-01-29|
|1  |tom |2024-01-28|
+---+----+----------+
*/

// spark.sql("DESCRIBE EXTENDED hive_catalog.hivedb.ice_ff").show(false)
/*
+----------------------------+----------------------------------------------------------------------------------------------------------------------+-------+
|col_name                    |data_type                                                                                                             |comment|
+----------------------------+----------------------------------------------------------------------------------------------------------------------+-------+
|id                          |int                                                                                                                   |NULL   |
|name                        |string                                                                                                                |NULL   |
|                            |                                                                                                                      |       |
|# Metadata Columns          |                                                                                                                      |       |
|_spec_id                    |int                                                                                                                   |       |
|_partition                  |struct<>                                                                                                              |       |
|_file                       |string                                                                                                                |       |
|_pos                        |bigint                                                                                                                |       |
|_deleted                    |boolean                                                                                                               |       |
|                            |                                                                                                                      |       |
|# Detailed Table Information|                                                                                                                      |       |
|Name                        |hive_catalog.db.tbl                                                                                                   |       |
|Type                        |MANAGED                                                                                                               |       |
|Location                    |s3://bucket/path/                                                                                                     |       |
|Provider                    |iceberg                                                                                                               |       |
|Owner                       |hadoop                                                                                                                |       |
|Table Properties            |[current-snapshot-id=1760975580047100766,format=iceberg/parquet,format-version=2,write.parquet.compression-codec=zstd]|       |
+----------------------------+----------------------------------------------------------------------------------------------------------------------+-------+
*/
```


The table metadata is stored in the following path: 

```scala
spark.sql(s"SELECT * FROM hive_catalog.db.tbl.metadata_log_entries").show(false)
/*
+-----------------------+----------------------------------------------------------------------------------+-------------------+----------------+----------------------+
|timestamp              |file                                                                              |latest_snapshot_id |latest_schema_id|latest_sequence_number|
+-----------------------+----------------------------------------------------------------------------------+-------------------+----------------+----------------------+
|2024-01-30 05:04:04.189|s3://bucket/path/metadata/00000-3c3df3b3-e356-4bf7-8aec-85f3c35c474b.metadata.json|5729127839002563214|0               |1                     |
+-----------------------+----------------------------------------------------------------------------------+-------------------+----------------+----------------------+
*/
```

The table metadata has the following Iceberg table information:

```json
// $ aws s3 cp s3://bucket/path/metadata/00000-3c3df3b3-e356-4bf7-8aec-85f3c35c474b.metadata.json -
{
  "format-version" : 2,
  "table-uuid" : "2dff40ad-cd3d-4880-8e91-8d0cbc9bd3fd",
  "location" : "s3://bucket/path",
  "last-sequence-number" : 1,
  "last-updated-ms" : 1706591044189,
  "last-column-id" : 3,
  "current-schema-id" : 0,
  "schemas" : [ {
    "type" : "struct",
    "schema-id" : 0,
    "fields" : [ {
      "id" : 1,
      "name" : "id",
      "required" : false,
      "type" : "int"
    }, {
      "id" : 2,
      "name" : "name",
      "required" : false,
      "type" : "string"
    }, {
      "id" : 3,
      "name" : "dt",
      "required" : false,
      "type" : "string"
    } ]
  } ],
  "default-spec-id" : 0,
  "partition-specs" : [ {
    "spec-id" : 0,
    "fields" : [ {
      "name" : "dt",
      "transform" : "identity",
      "source-id" : 3,
      "field-id" : 1000
    } ]
  } ],
  "last-partition-id" : 1000,
  "default-sort-order-id" : 0,
  "sort-orders" : [ {
    "order-id" : 0,
    "fields" : [ ]
  } ],
  "properties" : {
    "owner" : "hadoop",
    "write.parquet.compression-codec" : "zstd"
  },
  "current-snapshot-id" : 5729127839002563214,
  "refs" : {
    "main" : {
      "snapshot-id" : 5729127839002563214,
      "type" : "branch"
    }
  },
  "snapshots" : [ {
    "sequence-number" : 1,
    "snapshot-id" : 5729127839002563214,
    "timestamp-ms" : 1706591044189,
    "summary" : {
      "operation" : "append",
      "spark.app.id" : "application_1706583192068_0003",
      "added-data-files" : "2",
      "added-records" : "3",
      "added-files-size" : "1794",
      "changed-partition-count" : "2",
      "total-records" : "3",
      "total-files-size" : "1794",
      "total-data-files" : "2",
      "total-delete-files" : "0",
      "total-position-deletes" : "0",
      "total-equality-deletes" : "0"
    },
    "manifest-list" : "s3://bucket/path/metadata/snap-5729127839002563214-1-5b5646a8-d7ae-440b-ba72-ffae2b3975c5.avro",
    "schema-id" : 0
  } ],
  "statistics" : [ ],
  "snapshot-log" : [ {
    "timestamp-ms" : 1706591044189,
    "snapshot-id" : 5729127839002563214
  } ],
  "metadata-log" : [ ]
}
```


## 2. Create a `audit` branch from the current table records

In this section, create a new branch from the current 3 records in the Iceberg table. To do this, `write.wap.enabled` is required to set `true`. 

```scala
spark.sql(s"ALTER TABLE hive_catalog.db.tbl SET TBLPROPERTIES ('write.wap.enabled'='true')")
```

Then create a new branch `audit` for review new data that will be written into the Iceberg table. The branch is retained forever, and the snapshots are retained for 3 days.

```scala
spark.sql(s"ALTER TABLE hive_catalog.db.tbl CREATE BRANCH audit WITH SNAPSHOT RETENTION 3 DAYS")
```

## 3. Switch the current branch `main` to `audit` and add records into the Iceberg table

Change the current branch to `audit`. You can check the current branch with the Spark query: `SET spark.wap.branch` as follows:

```scala
spark.sql("SET spark.wap.branch = audit")

// Check the current branch
spark.sql("SET spark.wap.branch").show(false)
/*
+----------------+-----+
|key             |value|
+----------------+-----+
|spark.wap.branch|audit|
+----------------+-----+
*/
```

Check the records in the `audit` branch. The records are the same as the `main` branch.

```scala
spark.sql(s"SELECT * FROM hive_catalog.db.tbl").show(false)
/*
+---+----+----------+
|id |name|dt        |
+---+----+----------+
|3  |dev |2024-01-29|
|2  |tan |2024-01-29|
|1  |tom |2024-01-28|
+---+----+----------+
*/
```

Add new two records into the table. Here, one of the records `(1000, 'Invalid value')` is assumed to be a broken record, the other one is a normal record.

```scala
spark.sql(s"INSERT INTO hive_catalog.db.tbl VALUES (4, 'iceberg', '2024-01-30'), (1000, 'Invalid value', '2024-01-30')")

spark.sql(s"SELECT * FROM hive_catalog.db.tbl").show(false)
/*
+----+-------------+----------+
|id  |name         |dt        |
+----+-------------+----------+
|4   |iceberg      |2024-01-30|
|1000|Invalid value|2024-01-30|
|3   |dev          |2024-01-29|
|2   |tan          |2024-01-29|
|1   |tom          |2024-01-28|
+----+-------------+----------+
*/
```

Review the difference of records between the branches. The `main` branch has still 3 records and the new 2 records are not in the table.

```scala
spark.sql("SET spark.wap.branch = main")

spark.sql(s"SELECT * FROM hive_catalog.db.tbl").show(false)
/*
+---+----+----------+
|id |name|dt        |
+---+----+----------+
|3  |dev |2024-01-29|
|2  |tan |2024-01-29|
|1  |tom |2024-01-28|
+---+----+----------+
*/
```

### Review the S3 metadata
In “1. Create an Iceberg table with sample records”, only `00000-3c3df3b3-e356-4bf7-8aec-85f3c35c474b.metadata.json` was created, but there are 3 new files are created as follows now:

```
00000-3c3df3b3-e356-4bf7-8aec-85f3c35c474b.metadata.json
00001-2549ebf9-a6db-470b-a129-7b4d63211006.metadata.json -> "write.wap.enabled" : "true" is added
00002-585ebf63-98f2-4ca8-ab35-d446cb362cb6.metadata.json -> "audit" is added in the "refs" part
00003-388f56e8-0949-484d-b842-cd79b70d9c20.metadata.json -> new snapshotid pointed from audit is added
```

See the `diff` result between `00000` and `00003` in Appendix 2 at the bottom.

### Check all branches

```scala
spark.sql(s"SELECT * FROM hive_catalog.db.tbl.refs").show(false)
/*
+-----+------+-------------------+-----------------------+---------------------+----------------------+
|name |type  |snapshot_id        |max_reference_age_in_ms|min_snapshots_to_keep|max_snapshot_age_in_ms|
+-----+------+-------------------+-----------------------+---------------------+----------------------+
|main |BRANCH|5729127839002563214|NULL                   |NULL                 |NULL                  |
|audit|BRANCH|3060270616263082424|NULL                   |NULL                 |259200000             |
+-----+------+-------------------+-----------------------+---------------------+----------------------+
*/
```


## 4. Review the newly added records into `audit`

Before fast-forwarding `main` to `audit`, let’s review the records that added in the previous section. Two records were added, and one of them is broken. To achieve the WAP (Write-Audit-Publish) pattern, this review process is important for high data quality delivery to data consumers. In this post, we don’t focus on the data quality process, to simply demonstrate that process, just check the new records manually, and fix the broken record.

To fix the broken record, run the following `UPDATE` query.

```scala
spark.sql(s"UPDATE hive_catalog.db.tbl SET id = 5, name = 'icecube' WHERE id = 1000")
```

Then, check if the broken record is fixed.

```scala
spark.sql(s"SELECT * FROM hive_catalog.db.tbl").show(false)
/*
+---+-------+----------+
|id |name   |dt        |
+---+-------+----------+
|4  |iceberg|2024-01-30|
|5  |icecube|2024-01-30|
|3  |dev    |2024-01-29|
|2  |tan    |2024-01-29|
|1  |tom    |2024-01-28|
+---+-------+----------+
*/
```

## 5. Run fast forwarding

Run the following procedure to fast forward the current position in `main` to `audit`.


```scala
spark.sql(s"CALL hive_catalog.system.fast_forward(table => 'db.tbl', branch => 'main', to => 'audit')").show(false)
/*
+--------------+-------------------+-------------------+
|branch_updated|previous_ref       |updated_ref        |
+--------------+-------------------+-------------------+
|main          |5729127839002563214|5571823322290436651|
+--------------+-------------------+-------------------+
*/
```

Review the `main` branch records:

```scala
spark.sql("SET spark.wap.branch = main")

spark.sql(s"SELECT * FROM hive_catalog.db.tbl").show(false)
/*
+---+-------+----------+
|id |name   |dt        |
+---+-------+----------+
|4  |iceberg|2024-01-30|
|5  |icecube|2024-01-30|
|3  |dev    |2024-01-29|
|2  |tan    |2024-01-29|
|1  |tom    |2024-01-28|
+---+-------+----------+
*/
```



## Appendix

### 1. Iceberg configuration for Spark

Hive metastore is used as its backend. Here's the configuration that are passed to Spark.

```
$ spark-shell/spark-submit --master yarn --deploy-mode client \
--jars ./iceberg-aws-bundle-1.4.3.jar,./iceberg-spark-runtime-3.5_2.12-1.4.3.jar \
--conf spark.sql.catalog.hive_catalog=org.apache.iceberg.spark.SparkCatalog \
--conf spark.sql.catalog.hive_catalog.type=hive \
--conf spark.sql.catalog.hive_catalog.io-impl=org.apache.iceberg.aws.s3.S3FileIO \
--conf spark.sql.extensions=org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions
```

### 2. Difference between `00000` and `00003` snapshots


```diff
5,6c5,6
<   "last-sequence-number" : 1,
<   "last-updated-ms" : 1706593145650,
---
>   "last-sequence-number" : 2,
>   "last-updated-ms" : 1706594326918,
57c57
<       "snapshot-id" : 5729127839002563214,
---
>       "snapshot-id" : 3060270616263082424,
81a82,102
>   }, {
>     "sequence-number" : 2,
>     "snapshot-id" : 3060270616263082424,
>     "parent-snapshot-id" : 5729127839002563214,
>     "timestamp-ms" : 1706594326918,
>     "summary" : {
>       "operation" : "append",
>       "spark.app.id" : "application_1706583192068_0003",
>       "added-data-files" : "1",
>       "added-records" : "2",
>       "added-files-size" : "960",
>       "changed-partition-count" : "1",
>       "total-records" : "5",
>       "total-files-size" : "2754",
>       "total-data-files" : "3",
>       "total-delete-files" : "0",
>       "total-position-deletes" : "0",
>       "total-equality-deletes" : "0"
>     },
>     "manifest-list" : "s3://bucket/path/metadata/snap-3060270616263082424-1-6616ee87-3667-4b77-aef9-66cf35dacb0d.avro",
>     "schema-id" : 0
93a115,117
>   }, {
>     "timestamp-ms" : 1706593145650,
>     "metadata-file" : "s3://bucket/path/metadata/00002-585ebf63-98f2-4ca8-ab35-d446cb362cb6.metadata.json"
➜  fastforward code .
➜  fastforward diff 00000-3c3df3b3-e356-4bf7-8aec-85f3c35c474b.metadata.json 00003-388f56e8-0949-484d-b842-cd79b70d9c20.metadata.json
5,6c5,6
<   "last-sequence-number" : 1,
<   "last-updated-ms" : 1706591044189,
---
>   "last-sequence-number" : 2,
>   "last-updated-ms" : 1706594326918,
46a47
>     "write.wap.enabled" : "true",
53a55,59
>     },
>     "audit" : {
>       "snapshot-id" : 3060270616263082424,
>       "type" : "branch",
>       "max-snapshot-age-ms" : 259200000
75a82,102
>   }, {
>     "sequence-number" : 2,
>     "snapshot-id" : 3060270616263082424,
>     "parent-snapshot-id" : 5729127839002563214,
>     "timestamp-ms" : 1706594326918,
>     "summary" : {
>       "operation" : "append",
>       "spark.app.id" : "application_1706583192068_0003",
>       "added-data-files" : "1",
>       "added-records" : "2",
>       "added-files-size" : "960",
>       "changed-partition-count" : "1",
>       "total-records" : "5",
>       "total-files-size" : "2754",
>       "total-data-files" : "3",
>       "total-delete-files" : "0",
>       "total-position-deletes" : "0",
>       "total-equality-deletes" : "0"
>     },
>     "manifest-list" : "s3://bucket/path/metadata/snap-3060270616263082424-1-6616ee87-3667-4b77-aef9-66cf35dacb0d.avro",
>     "schema-id" : 0
82c109,118
<   "metadata-log" : [ ]
---
>   "metadata-log" : [ {
>     "timestamp-ms" : 1706591044189,
>     "metadata-file" : "s3://bucket/path/metadata/00000-3c3df3b3-e356-4bf7-8aec-85f3c35c474b.metadata.json"
>   }, {
>     "timestamp-ms" : 1706591507126,
>     "metadata-file" : "s3://bucket/path/metadata/00001-2549ebf9-a6db-470b-a129-7b4d63211006.metadata.json"
>   }, {
>     "timestamp-ms" : 1706593145650,
>     "metadata-file" : "s3://bucket/path/metadata/00002-585ebf63-98f2-4ca8-ab35-d446cb362cb6.metadata.json"
>   } ]
```

