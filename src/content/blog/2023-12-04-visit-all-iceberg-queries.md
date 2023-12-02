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
    * `CREATE TABLE PARTITIONED BY`
    * CTAS
    * `ALTER TABLE`
    * DataFrame `df.writeTo`
* Reads:
    * `SELECT ... FROM ...`
    * Time travels `AS OF version|timestamp`
    * Table inspections
* Writes:
    * `INSERT INTO ... VALUES`
* Procedures:
    * `expire_snapshots`

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
== STORAGE ==
spark.sql(s"DESCRIBE EXTENDED $catalog.$db.$tbl").show(100, false)
???

== STORAGE ==
*/
```

```scala
spark.sql(s"""
CREATE TABLE $catalog.$db.$tbl (id int, name string) USING iceberg
LOCATION '$location'
""")

/* Output
== TABLE ==
spark.sql(s"DESCRIBE EXTENDED $catalog.$db.$tbl").show(100, false)
???

== STORAGE ==
*/
```

### `CREATE TABLE PARTITIONED BY`

```scala
spark.sql(s"""
CREATE TABLE $catalog.$db.$tbl (id int, name string) USING iceberg
LOCATION '$location'
""")
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