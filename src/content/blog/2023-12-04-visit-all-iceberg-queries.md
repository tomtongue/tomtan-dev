---
title: 'Revisit all Iceberg queries'
description: 'Run all Iceberg queries such as DDLs, Reads, Writes and Procedures and review the results'
pubDate: 'Dec. 4 2023'
tags: ['iceberg']
---

*This page is in progress*.

## Overview

In this blog post, we visit all Iceberg APIs via Spark and review the results. Specifically, we look into the following categories and APIs in each category:

* Iceberg configuration - The "Catalog" and "Storage" configuration for SparkSession to use Iceberg with Spark.
* DDLs:
    * `CREATE TABLE`
    * CTAS
    * RTAS
    * `ALTER TABLE`
    * `ALTER TABLE` with IcebergSQLExtensions
    * DataFrame `df.writeTo.create()|.createOreReplace()`
* Reads:
    * `SELECT ... FROM ...`
    * Time travels `AS OF version|timestamp`
    * Table inspections
* Writes:
    * `INSERT INTO ... VALUES`
* Procedures:
    * Table maintenance
        * `expire_snapshots`
    * Table migration
        * `snapshot`
        * `migrate`
        * `add_files`
        * `register_table`
        * Delta Lake table migration


## Iceberg configuration

* Built-in catalog
    * `hive`
    * `hadoop`
    * `rest`
* Custom catalog - you need to set the custom catalog class to `catalog-impl` for the Spark configuration

```scala
val catalog = "<ARBITRARY_CATALOG_NAME>"
val db = "<YOUR_DB>"
val tbl = "<YOUR_TABLE>"

val spark: SparkSession = 
    SparkSession.builder
        .config("key", "value")
        .getOrCreate()
```

## DDLs
### `CREATE TABLE`

```scala
spark.sql(s"""
CREATE TABLE $catalog.$db.$tbl (id int, name string) USING iceberg
""")

/* Output
== TABLE ==
spark.sql(s"DESCRIBE EXTENDED $catalog.$db.$tbl").show(100, false)
+----------------------------+-------------------------------------------------------------------------------------------------------+-------+
|col_name                    |data_type                                                                                              |comment|
+----------------------------+-------------------------------------------------------------------------------------------------------+-------+
|id                          |int                                                                                                    |NULL   |
|name                        |string                                                                                                 |NULL   |
|                            |                                                                                                       |       |
|# Metadata Columns          |                                                                                                       |       |
|_spec_id                    |int                                                                                                    |       |
|_partition                  |struct<>                                                                                               |       |
|_file                       |string                                                                                                 |       |
|_pos                        |bigint                                                                                                 |       |
|_deleted                    |boolean                                                                                                |       |
|                            |                                                                                                       |       |
|# Detailed Table Information|                                                                                                       |       |
|Name                        |catalog.db.tbl                                                                                         |       |
|Type                        |MANAGED                                                                                                |       |
|Location                    |s3://your/warehouse/path                                                                               |       |
|Provider                    |iceberg                                                                                                |       |
|Owner                       |tom                                                                                                    |       |
|Table Properties            |[current-snapshot-id=none,format=iceberg/parquet,format-version=2,write.parquet.compression-codec=zstd]|       |
+----------------------------+-------------------------------------------------------------------------------------------------------+-------+

== STORAGE ==
s3://your/warehouse/path/
        └── db.db/
                └── tbl/
                    └── metadata/
                            └── 00000-2f04830a-0c79-45f5-bacd-65939689a21b.metadata.json
*/
```

### `CREATE TABLE LOCATION`

```scala
spark.sql(s"""
CREATE TABLE $catalog.$db.$tbl (id int, name string) USING iceberg
LOCATION '$location'
""")

/* Output
== TABLE ==
spark.sql(s"DESCRIBE EXTENDED $catalog.$db.$tbl").show(100, false)
+----------------------------+-------------------------------------------------------------------------------------------------------+-------+
|col_name                    |data_type                                                                                              |comment|
+----------------------------+-------------------------------------------------------------------------------------------------------+-------+
|id                          |int                                                                                                    |NULL   |
|name                        |string                                                                                                 |NULL   |
|                            |                                                                                                       |       |
|# Metadata Columns          |                                                                                                       |       |
|_spec_id                    |int                                                                                                    |       |
|_partition                  |struct<>                                                                                               |       |
|_file                       |string                                                                                                 |       |
|_pos                        |bigint                                                                                                 |       |
|_deleted                    |boolean                                                                                                |       |
|                            |                                                                                                       |       |
|# Detailed Table Information|                                                                                                       |       |
|Name                        |catalog.db.tbl                                                                                         |       |
|Type                        |MANAGED                                                                                                |       |
|Location                    |s3://bucket/path/to/location                                                                           |       |
|Provider                    |iceberg                                                                                                |       |
|Owner                       |tom                                                                                                    |       |
|Table Properties            |[current-snapshot-id=none,format=iceberg/parquet,format-version=2,write.parquet.compression-codec=zstd]|       |
+----------------------------+-------------------------------------------------------------------------------------------------------+-------+

== STORAGE ==
s3://bucket/path/to/location/ 
        └── metadata/
                └── 00000-42cace89-7479-4cae-b67d-4ee84bb73a8f.metadata.json
*/
```

### `CREATE TABLE PARTITIONED BY`

```scala
spark.sql(s"""
CREATE TABLE $catalog.$db.$tbl (id int, name string, year int) USING iceberg
LOCATION '$location'
PARTITIONED BY (year)
""")

/* Output
== TABLE ==
spark.sql(s"DESCRIBE EXTENDED $catalog.$db.$tbl").show(100, false)
+----------------------------+-------------------------------------------------------------------------------------------------------+-------+
|col_name                    |data_type                                                                                              |comment|
+----------------------------+-------------------------------------------------------------------------------------------------------+-------+
|id                          |int                                                                                                    |NULL   |
|name                        |string                                                                                                 |NULL   |
|year                        |int                                                                                                    |NULL   |
|# Partition Information     |                                                                                                       |       |
|# col_name                  |data_type                                                                                              |comment|
|year                        |int                                                                                                    |NULL   |
|                            |                                                                                                       |       |
|# Metadata Columns          |                                                                                                       |       |
|_spec_id                    |int                                                                                                    |       |
|_partition                  |struct<year:int>                                                                                       |       |
|_file                       |string                                                                                                 |       |
|_pos                        |bigint                                                                                                 |       |
|_deleted                    |boolean                                                                                                |       |
|                            |                                                                                                       |       |
|# Detailed Table Information|                                                                                                       |       |
|Name                        |catalog.db.tbl                                                                                         |       |
|Type                        |MANAGED                                                                                                |       |
|Location                    |s3://bucket/path/to/location                                                                           |       |
|Provider                    |iceberg                                                                                                |       |
|Owner                       |tom                                                                                                    |       |
|Table Properties            |[current-snapshot-id=none,format=iceberg/parquet,format-version=2,write.parquet.compression-codec=zstd]|       |
+----------------------------+-------------------------------------------------------------------------------------------------------+-------+

== STORAGE ==
Just after the table creation, the structure is the same as `CREATE TABLE LOCATION`.

s3://bucket/path/to/location/ 
        └── metadata/
                └── 00000-210b098f-4717-48fa-ae81-8a19a023c61d.metadata.json

But, after running `INSERT INTO`, the data is written into the partitioned path:
> spark.sql(s"INSERT INTO $cat.$db.emr7_p3 VALUES (1, 'alice', 2024)")

s3://bucket/path/to/location/ 
        ├── data/
        │   └── year=2024/
        │           └── 00000-1-b642626c-2618-4c9f-a7f1-05a02f302208-00001.parquet  // <= Partitioned path
        └── metadata/
            ├── 00000-210b098f-4717-48fa-ae81-8a19a023c61d.metadata.json
            ├── 00001-382c8f80-5187-4e20-a541-5ae87fbd86ef.metadata.json
            ├── 283ebc64-2d1b-4f43-88d2-2a9e2b186f2a-m0.avro
            └── snap-7959315966124927622-1-283ebc64-2d1b-4f43-88d2-2a9e2b186f2a.avro

*/
```

### `CREATE TABLE TBLPROPERTIES`

```scala
spark.sql(s"""
CREATE TABLE $catalog.$db.$tbl (id int, name string, year int) USING iceberg
LOCATION '$location'
TBLPROPERTIES('write.metadata.compression-codec'='gzip')
PARTITIONED BY (year)
""")

/* Output
== TABLE ==
spark.sql(s"DESCRIBE EXTENDED $catalog.$db.$tbl").show(100, false)
+----------------------------+---------------------------------------------------------------------------------------------------------------------------------------------+-------+
|col_name                    |data_type                                                                                                                                    |comment|
+----------------------------+---------------------------------------------------------------------------------------------------------------------------------------------+-------+
|id                          |int                                                                                                                                          |NULL   |
|name                        |string                                                                                                                                       |NULL   |
|year                        |int                                                                                                                                          |NULL   |
|# Partition Information     |                                                                                                                                             |       |
|# col_name                  |data_type                                                                                                                                    |comment|
|year                        |int                                                                                                                                          |NULL   |
|                            |                                                                                                                                             |       |
|# Metadata Columns          |                                                                                                                                             |       |
|_spec_id                    |int                                                                                                                                          |       |
|_partition                  |struct<year:int>                                                                                                                             |       |
|_file                       |string                                                                                                                                       |       |
|_pos                        |bigint                                                                                                                                       |       |
|_deleted                    |boolean                                                                                                                                      |       |
|                            |                                                                                                                                             |       |
|# Detailed Table Information|                                                                                                                                             |       |
|Name                        |catalog.db.tbl                                                                                                                               |       |
|Type                        |MANAGED                                                                                                                                      |       |
|Location                    |s3://bucket/path/to/location                                                                                                                 |       |
|Provider                    |iceberg                                                                                                                                      |       |
|Owner                       |hadoop                                                                                                                                       |       |
|Table Properties            |[current-snapshot-id=none,format=iceberg/parquet,format-version=2,write.metadata.compression-codec=gzip,write.parquet.compression-codec=zstd]|       |
+----------------------------+---------------------------------------------------------------------------------------------------------------------------------------------+-------+

== STORAGE ==
s3://bucket/path/to/location/ 
        └── metadata/
                └── 00000-1eba3ad1-b556-4d04-8f3b-1fe5676006be.gz.metadata.json
*/
```

### CTAS (`CREATE TABLE AS SELECT`)

```scala
spark.sql(s"""
CREATE TABLE $catalog.$db.$tbl
USING iceberg
AS SELECT * FROM tmp
""")

/* Output
== TABLE ==
spark.sql(s"DESCRIBE EXTENDED $catalog.$db.$tbl").show(100, false)
???

== STORAGE ==
*/
```

CTAS with table properties and partitions:

```scala
spark.sql(s"""
CREATE TABLE $catalog.$db.$tbl
USING iceberg
PARTITIONED BY (year, month, day)
TBLPROPERTIES(''='')
AS SELECT * FROM tmp
""")

/* Output
== tmp ==
> spark.sql("SELECT * FROM tmp").show(false)


== TABLE ==
> spark.sql(s"DESCRIBE EXTENDED $catalog.$db.$tbl").show(100, false)
???

== STORAGE ==
*/
```

### RTAS (`REPLACE TABLE AS SELECT`)

```scala
spark.sql(s"""
REPLACE TABLE $catalog.$db.$tbl
USING iceberg
AS SELECT * FROM tmp
""")

/* Output
== TABLE ==
spark.sql(s"DESCRIBE EXTENDED $catalog.$db.$tbl").show(100, false)
???

== STORAGE ==
*/
```

RTAS with table properties and partitions:

```scala
spark.sql(s"""
REPLACE TABLE $catalog.$db.$tbl
USING iceberg
PARTITIONED BY (year, month, day)
TBLPROPERTIES(''='')
AS SELECT * FROM tmp
""")

/* Output
== TABLE ==
spark.sql(s"DESCRIBE EXTENDED $catalog.$db.$tbl").show(100, false)
???

== STORAGE ==
*/
```

### `ALTER TABLE RENAME TO`

### `ALTER TABLE SET TBLPROPERTIES`

### `ALTER TABLE ADD COLUMN`

### ALTER TABLE for Branching and Tagging
Here's the Branching queries template:


```sql
ALTER TABLE catalog.db.tbl
(0) CREATE BRANCH <branch> 
(1) CREATE BRANCH <branch> AS OF VERSION <snapshotId>
(2) CREATE BRANCH <branch> AS OF VERSION <snapshotId> RETAIN <num> DAYS|HOURS|MINUTES
(3.1) CREATE BRANCH <branch> AS OF VERSION <snapshotId> RETAIN <num> DAYS|HOURS|MINUTES WITH SNAPSHOT RETENTION <num> SNAPSHOTS
(3.2) CREATE BRANCH <branch> AS OF VERSION <snapshotId> RETAIN <num> DAYS|HOURS|MINUTES WITH SNAPSHOT RETENTION <num> DAYS|HOURS|MINUTES
(3.3) CREATE BRANCH <branch> AS OF VERSION <snapshotId> RETAIN <num> DAYS|HOURS|MINUTES WITH SNAPSHOT RETENTION <num> SNAPSHOTS <num> DAYS|HOURS|MINUTES
```

Here's the Tagging queries template:

```sql
ALTER TABLE catalog.db.tbl
(0) CREATE TAG <tag> 
(1) CREATE TAG <tag> AS OF VERSION <snapshotId>
(2) CREATE TAG <tag> AS OF VERSION <snapshotId> RETAIN <num> DAYS|HOURS|MINUTES
```


## Reads

```scala
spark.sql(s"""
SELECT * FROM $catalog.$db.$tbl
""")
```

## Writes


```scala
spark.sql(s"""
INSERT INTO $catalog.$db.$tbl VALUES (1, 'alice'), (2, 'bob')
""")
```

## Procedures

```scala
spark.sql(s"""
CALL $catalog.system.expire_snapshots(...)
""")
```

### Table Migration

#### `snapshot`

```scala
spark.conf.set("spark.sql.catalog.spark_catalog", "org.apache.iceberg.spark.SparkSessionCatalog")

spark.sql(s"""
    CALL hive_catalog.system.snapshot(
        source_table => 'db.spark_tbl', 
        table => 'spark_tbl_backup')
""")

/* Output
+--------------------+
|migrated_files_count|
+--------------------+
|                   2|
+--------------------+
*/
```

#### `migrate`

```scala
spark.conf.set("spark.sql.catalog.spark_catalog", "org.apache.iceberg.spark.SparkSessionCatalog")

spark.sql(s"""
    CALL hive_catalog.system.migrate(
        table => 'db.spark_tbl', 
        backup_table_name => 'spark_tbl_backup')
""")

/* Output
+--------------------+
|migrated_files_count|
+--------------------+
|                   2|
+--------------------+
*/
```


#### `add_files`

```scala
spark.sql(s"""
    CALL hive_catalog.system.add_files(
        table => 'db.spark_tbl', 
        backup_table_name => 'spark_tbl_backup')
""")
```

#### `register_table`

```scala
spark.sql(s"""
    CALL glue_catalog.system.register_table (
        table => 'db.tbl',
        metadata_file => '/path/to/metadata.json'
    )
""")
```

#### Delta Lake table migration

```scala
import org.apache.hadoop.conf.Configuration
import org.apache.iceberg.catalog.{Catalog, TableIdentifier}
import org.apache.iceberg.delta.DeltaLakeToIcebergMigrationActionsProvider


DeltaLakeToIcebergMigrationActionsProvider.defaultActions()
    .snapshotDeltaLakeTable("")
    .as(TableIdentifier.of("db", "tbl"))
    .icebergCatalog(Catalog)
    .tableLocation("")
    .deltaLakeConfiguration(Configuration)
    .tableProperty("key", "value")
    .execute()

```

### Change Data Capture
