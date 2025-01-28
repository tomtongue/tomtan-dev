---
title: 'Iceberg V3 Spec Summary'
description: 'Summarize Iceberg V3 Spec '
pubDate: 'Feb. 10 2025'
draft: true
tags: ['iceberg']
---

## Iceberg format version

### When the format version is upgraded?

https://iceberg.apache.org/spec/#format-versioning

> The format version number is incremented when new features are added that will break forward-compatibility---that is, when older readers would not read newer table features correctly. Tables may continue to be written with an older version of the spec to ensure compatibility by not using features that are not yet implemented by processing engines.

* 古い reader は newer version を正しく読むことができない

### History

* 2023 Aug. 31 - V2 default version (since Iceberg 1.4.0)
  * [Core: Use V2 format in new tables by default by aokolnychyi · Pull Request \#8381 · apache/iceberg](https://github.com/apache/iceberg/pull/8381)
* 2021 Aug.3 - [V3 Spec and impl]
* 2021 July 28 - Aug. 3 [V2 spec finalized] Iceberg format version 2 の Spec が Finalized (vote で終了 ref: https://lists.apache.org/thread/ws2gg52d124p7bx9jgrn3kctrtfgtltp)
  * Iceberg 0.12.0 announcement 
* 2020 Nov. 10 - Format V2 support started (Iceberg 0.10.0)
* 2020 May 20 - The Iceberg project graduated on 2020-05-20
* 2020 Apr あたり (はっきりとはわからないが、0.8.0 と 0.7.0 の間で、Row Delete を v2 とするかといったような会話は見つけられた)
  * [Prepare metadata writers for format v2 by rdblue · Pull Request \#903 · apache/iceberg](https://github.com/apache/iceberg/pull/903)
  * Iceberg 0.8.0 incub と Iceberg 0.7.0 incub の間で v2 が追加される
    * https://github.com/apache/iceberg/blob/8c05a2f5f1c8b111c049d43cf15cd8a51920dda1/site/docs/spec.md -> 0.8.0 (May 7, 2020)
    * https://github.com/apache/iceberg/blob/9c81babac65351f7aa21dd878f01c5c81ae304af/site/docs/spec.md -> 0.7.0 (Oct 26, 2019)
    * 関連する Spec: https://github.com/apache/iceberg/pull/912 (Spec. が追加されたのは 2020 Apr)
    

Spec に対する Behavioral or functional changes は vote によって決まるが、これがそのタイミングによって format version X に入るかが決まる仕組み

## V3 Spec references

* V2 の様子を見ると V3 Spec が Finalize するのはまだ時間がかかりそう
* Document だと:

> New data types: nanosecond timestamp(tz), unknown, variant, geometry, geography  
> Default value support for columns  
> Multi-argument transforms for partitioning and sorting  
> Row Lineage tracking  
> Binary deletion vectors  

* Meetup notes だと
    * Data types: Variant type, Geo types, Timestamp_TZ, unknown
    * Improved Deletes: Deletion vectors, Optimized tracking (???), Compact representaion (???)
    * Rown Lineage: Row tracking, Incremental processing (???)
* V3 project overall in Github: https://github.com/orgs/apache/projects/377/views/1
    * V3 class creation: https://github.com/apache/iceberg/issues/10747
    * Milestone Spec: https://github.com/apache/iceberg/milestone/42?closed=1


### Supported status
Specs: [Iceberg V3 Spec Milestone · apache/iceberg](https://github.com/apache/iceberg/milestone/42)

* [Variant Data Type Support · Issue \#10392 · apache/iceberg](https://github.com/apache/iceberg/issues/10392) (Opened)
  * [New Types: JSONB / JSON · Issue \#9066 · apache/iceberg](https://github.com/apache/iceberg/issues/9066)
* [Geospatial Support · Issue \#10260 · apache/iceberg](https://github.com/apache/iceberg/issues/10260) (Opened)
* [Improve Position Deletes in V3 · Issue \#11122 · apache/iceberg](https://github.com/apache/iceberg/issues/11122 ) (Opened)
* [Spec: Support geo type by szehon-ho · Pull Request \#10981 · apache/iceberg](https://github.com/apache/iceberg/pull/10981)
* [Restrict generated locations to URI syntax · Issue \#10168 · apache/iceberg](https://github.com/apache/iceberg/issues/10168) -> Non stale
* [Row Lineage for V3 · Issue \#11129 · apache/iceberg](https://github.com/apache/iceberg/issues/11129)
  * [Spec: Adds Row Lineage by RussellSpitzer · Pull Request \#11130 · apache/iceberg](https://github.com/apache/iceberg/pull/11130)
* [Spec: Add v3 types and type promotion by rdblue · Pull Request \#10955 · apache/iceberg](https://github.com/apache/iceberg/pull/10955)
  * [API, Core: Add default value APIs and Avro implementation by wmoustafa · Pull Request \#9502 · apache/iceberg](https://github.com/apache/iceberg/pull/9502)

| Category    | Feature                                          | Spec                                                         | Impl                             |
|-------------|--------------------------------------------------|--------------------------------------------------------------|----------------------------------|
| Data types  | Variant types                                    | YES ([\#10392](https://github.com/apache/iceberg/issues/10392), [Proposal](https://docs.google.com/document/d/1sq70XDiWJ2DemWyA5dVB80gKzwi0CWoM0LOWM7VJVd8)) | YES Parquet ??? ORC ??? Avro ??? |
|             | Type promotion                                   | YES                                                          |                                  |
|             | Geospatial types                                 | YES                                                          |                                  |
|             | Unknown types                                    | YES                                                          |                                  |
|             | Nano seconds Timestamp TZ                        | YES                                                          | YES (#???)                       |
|             |                                                  |                                                              |                                  |
| Row lineage | Row tracking                                     | YES (#???)                                                   | YES (#???)                       |
|             |                                                  |                                                              |                                  |
|             |                                                  |                                                              |                                  |
| Others      | Multi-args transformations for Partitons/Sorting |                                                              |                                  |



### Data types

* Variant types:
    * Spec: 
        * [Variant Data Type Support Proposal in Iceberg](https://docs.google.com/document/d/1sq70XDiWJ2DemWyA5dVB80gKzwi0CWoM0LOWM7VJVd8)
        * Related: [Iceberg Metadata for Variant Shredding](https://docs.google.com/document/d/1gAvt0x_ez89O8y-YqkCdMnTEykb-583YslYOgzf5sPg)
    * Impl: [Spec: add variant type by aihuaxu · Pull Request \#10831 · apache/iceberg](https://github.com/apache/iceberg/pull/10831)
* Geo types:
    * Spec: [Spec: Support geo type by szehon-ho · Pull Request \#10981 · apache/iceberg](https://github.com/apache/iceberg/pull/10981)
        * [Geospatial Support #10260](https://github.com/apache/iceberg/issues/10260)
        * [Geospatial Support Proposal](https://docs.google.com/document/d/1iVFbrRNEzZl8tDcZC81GFt01QJkLJsI9E2NBOt21IRI)
* Unknown types:
    * Spec: https://iceberg.apache.org/spec/#primitive-types
    * [Support UnknownType for V3 Schema](https://github.com/apache/iceberg/issues/11732)
    * Impl: [API: Add `UnknownType` by Fokko · Pull Request \#12012 · apache/iceberg](https://github.com/apache/iceberg/pull/12012)
* Nano seconds Timestamp_TZ:
    * Spec: [Spec: add nanosecond timestamp types by jacobmarble · Pull Request \#8683 · apache/iceberg](https://github.com/apache/iceberg/pull/8683)
    * Impl: [API: implement types timestamp_ns and timestamptz_ns by jacobmarble · Pull Request \#9008 · apache/iceberg](https://github.com/apache/iceberg/pull/9008)
* Multi-args transformations:
    * Spec: [Multi-arg transform support in Iceberg](https://docs.google.com/document/d/1aDoZqRgvDOOUVAGhvKZbp5vFstjsAMY4EFCyjlxpaaw)
    * Sub-impls: [spec: Remove `source-ids` for `V{1,2}` tables by Fokko · Pull Request \#12161 · apache/iceberg](https://github.com/apache/iceberg/pull/12161) -> 多分 bug fix


### Improved Deletes

* Deletion vectors:
    * Spec: [Proposal: Introduce deletion vector file to reduce write amplification](https://docs.google.com/document/d/1FtPI0TUzMrPAFfWX_CA9NL6m6O1uNSxlpDsR-7xpPL0)
        * [Spec v3: Add deletion vectors to the table spec by rdblue · Pull Request \#11240 · apache/iceberg](https://github.com/apache/iceberg/pull/11240)
    * Impl: 


### Row Lineage

* Spec: [Row Lineage Proposal](https://docs.google.com/document/d/146YuAnU17prnIhyuvbCtCtVSavyd5N7hKryyVRaFDTE)
* Impl: 
    * [Spec: Adds Row Lineage by RussellSpitzer · Pull Request \#11130 · apache/iceberg](https://github.com/apache/iceberg/pull/11130)
    * [Core, API, Spec: Metadata Row Lineage by RussellSpitzer · Pull Request \#11948 · apache/iceberg](https://github.com/apache/iceberg/pull/11948)
* Sub-impls:
    * [Core: Checks for Equality Delete when Row Lineage is Enabled - Using Snapshot Summary by RussellSpitzer · Pull Request \#12075 · apache/iceberg](https://github.com/apache/iceberg/pull/12075/files) -> Equality delete だと壊れるので、checker を入れている
    * Sub-spec: [Spec: Add added-rows field to Snapshot by RussellSpitzer · Pull Request \#11976 · apache/iceberg](https://github.com/apache/iceberg/pull/11976)

### Misc.

* Default value:
    * Impl: [Spark 3.5: Support default values in Parquet reader by rdblue · Pull Request \#11803 · apache/iceberg](https://github.com/apache/iceberg/pull/11803)
* Metadata variant shreading:
    * Spec: [Iceberg Metadata for Variant Shredding](https://docs.google.com/document/d/1gAvt0x_ez89O8y-YqkCdMnTEykb-583YslYOgzf5sPg)
* V3 encryption: [\[Priority 2\] Spec v3: Encryption • apache](https://github.com/orgs/apache/projects/393/views/1)


## Released features for V3
### 1.8.0

* Spec
  * Add Deletion vectors to the table specification ([\#11240](https://github.com/apache/iceberg/pull/11240))
  * Add Variant Type ([\#10831](https://github.com/apache/iceberg/pull/10831))
  * Add EnableRowLineage metadata update ([\#12050](https://github.com/apache/iceberg/pull/12050))
  * Add added-rows field to Snapshot ([\#11976](https://github.com/apache/iceberg/pull/11976))
  * Reassign row lineage field IDs ([\#12100](https://github.com/apache/iceberg/pull/12100))
* API
  * Define Variant Data type ([\#11324](https://github.com/apache/iceberg/pull/11324))
  * Add UnknownType ([\#12012](https://github.com/apache/iceberg/pull/12012))
* Core:
    * Support for reading Deletion Vectors (#11481)
    * Support for writing Deletion Vectors (#11476)
    * Implement table metadata fields for row lineage and enable operations to populate these fields (#11948)
* AWS:
    * Support for writing Deletion Vectors (#11476)
* Spark:
    * Support for reading default values for Parquet (#11803)
    * Support for writing Deletion Vectors for V3 tables (#11561)


### 1.7.0

* API
  * Add default value APIs and Avro implementation ([\#9502](https://github.com/apache/iceberg/pull/9502))
  * Add compatibility checks for Schemas with default values ([\#11434](https://github.com/apache/iceberg/pull/11434))
  * Implement types timestamp_ns and timestamptz_ns ([\#9008](https://github.com/apache/iceberg/pull/9008))
  * Add addNonDefaultSpec to UpdatePartitionSpec to not set the new partition spec as default ([\#10736](https://github.com/apache/iceberg/pull/10736))

## For study

* V3 and REST Spec overview: https://www.youtube.com/watch?v=0C8CLOzNVEU
* Variant type: https://www.youtube.com/watch?v=MKqllL_D-fs
* Deletion Vectors: https://www.youtube.com/watch?v=vjgJridq8G0