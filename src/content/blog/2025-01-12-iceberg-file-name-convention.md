---
title: 'Iceberg metadata file name convention'
description: 'The naming convention for Iceberg metadata files'
pubDate: 'Jan. 12 2025'
draft: true
tags: ['iceberg']
---

## Summary

The following table shows the summary of the Iceberg’s file name convention:

| File name     | Convention                                                   | Note                                                         |
|---------------|--------------------------------------------------------------|--------------------------------------------------------------|
| metadata      | `<versionNumber>-<UUID>.json`                                | The metadata’s UUID doesn’t match the `commitUUID` (= snapshot ID) related to manifest lists and manifest files |
| manifest list | `snap-<snapshotId>-<attempt.incrementAndGet()>-<commitUUID>.avro` | The `commitUUID` (= snapshot ID) matches that of manifest files |
| manifest file | `<commitUUID>-m<manifestCount.getAndIncrement>.avro`         |                                                              |

## Details
When you operate something on your Iceberg table via a distributed computing engine such as Apache Spark, Trino, Flink etc, you might see the following files are generated:

```
/iceberg-warehouse/db/table/metadata
	00000-73b992ab-3e27-4f7a-bdc0-88b9fe79c9cf.metadata.json

```


### Code references

Manifest list: `snap-<snapshotId>-<attempt.incrementAndGet()>-<commitUUID>.avro`
https://github.com/apache/iceberg/blob/apache-iceberg-1.7.1/core/src/main/java/org/apache/iceberg/SnapshotProducer.java#L511

```java
  protected OutputFile manifestListPath() {
    return ops.io()
        .newOutputFile(
            ops.metadataFileLocation(
                FileFormat.AVRO.addExtension(
                    String.format(
                        Locale.ROOT,
                        "snap-%d-%d-%s",  // <= HERE
                        snapshotId(),
                        attempt.incrementAndGet(),
                        commitUUID))));
```

Manifest file: `<commitUUID>-m<manifestCount.getAndIncrement>.avro`
https://github.com/apache/iceberg/blob/apache-iceberg-1.7.1/core/src/main/java/org/apache/iceberg/SnapshotProducer.java#L527

```java
  protected EncryptedOutputFile newManifestOutputFile() {
    String manifestFileLocation =
        ops.metadataFileLocation(
            FileFormat.AVRO.addExtension(commitUUID + "-m" + manifestCount.getAndIncrement())); // <= HERE
    return EncryptingFileIO.combine(ops.io(), ops.encryption())
        .newEncryptingOutputFile(manifestFileLocation);
```

`manifestCount`:
https://github.com/apache/iceberg/blob/apache-iceberg-1.7.1/core/src/main/java/org/apache/iceberg/SnapshotProducer.java#L111

```java
  private final AtomicInteger manifestCount = new AtomicInteger(0);
```
