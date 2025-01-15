---
title: 'Iceberg metadata naming convention'
description: 'Learn Iceberg metadata file naming conventions.'
pubDate: 'Jan. 15 2025'
tags: ['iceberg']
---

The following table shows the summary of the Iceberg’s file name convention:

| File name     | Convention                                                   | Note                                                         |
|---------------|--------------------------------------------------------------|--------------------------------------------------------------|
| metadata file     | `<newVersion (%05d)>-<UUID>.<fileExtension>`                                | The metadata’s UUID doesn’t match the `commitUUID` (= snapshot ID) related to manifest lists and manifest files. The file extension includes `.gz` or `.json` |
| manifest list | `snap-<snapshotId>-<attempt.incrementAndGet()>-<commitUUID>.avro` | The `commitUUID` (= snapshot ID) matches that of manifest files |
| manifest file | `<commitUUID>-m<manifestCount.getAndIncrement>.avro`         |       n/a                                                      |

## Details
When you operate something on your Iceberg table via a distributed computing engine such as Apache Spark, Trino, Flink etc, you might see the following files are generated:

```
/iceberg-warehouse/db/table/metadata
  ├── 00000-25005c05-834d-4650-a529-410eabcb12d6.metadata.json // metadata file
  ├── 00001-65f87f03-6d7e-41be-8dce-c813ffe70937.metadata.json 
  ├── snap-1081867561747206961-1-fc6cefef-bfb2-4c11-a105-205785bcb5ac.avro // manifest list
  ├── fc6cefef-bfb2-4c11-a105-205785bcb5ac-m0.avro // manifest file
```

That is the situation after creating an Iceberg table (only the metadata file starting from `00000-` is created), and then adding a record into the table. Looking at each file name, 

* The UUID in the metadata file name doesn't match any manifest lists or manifest files
* The UUID (`fc6cefef-bfb2-4c11-a105-205785bcb5ac`) in the manifest list name matches the UUID in the manifest file name (`fc6cefef-bfb2-4c11-a105-205785bcb5ac`)

Let's see the relevant code in the Iceberg repository.

## Code references

### Metadata file `<newVersion (%05d)>-<UUID>.<fileExtension>`

See https://github.com/apache/iceberg/blob/apache-iceberg-1.7.1/core/src/main/java/org/apache/iceberg/BaseMetastoreTableOperations.java#L328

```java
  private String newTableMetadataFilePath(TableMetadata meta, int newVersion) {
    String codecName =
        meta.property(
            TableProperties.METADATA_COMPRESSION, TableProperties.METADATA_COMPRESSION_DEFAULT);
    String fileExtension = TableMetadataParser.getFileExtension(codecName);
    return metadataFileLocation(
        meta,
        String.format(Locale.ROOT, "%05d-%s%s", newVersion, UUID.randomUUID(), fileExtension));
  }
```

### Manifest list: `snap-<snapshotId>-<attempt.incrementAndGet()>-<commitUUID>.avro`

See https://github.com/apache/iceberg/blob/apache-iceberg-1.7.1/core/src/main/java/org/apache/iceberg/SnapshotProducer.java#L511

```java
import java.util.UUID;

// ...

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

### Manifest file: `<commitUUID>-m<manifestCount.getAndIncrement>.avro`

See https://github.com/apache/iceberg/blob/apache-iceberg-1.7.1/core/src/main/java/org/apache/iceberg/SnapshotProducer.java#L527

```java
import java.util.UUID;

// ....

  protected EncryptedOutputFile newManifestOutputFile() {
    String manifestFileLocation =
        ops.metadataFileLocation(
            FileFormat.AVRO.addExtension(commitUUID + "-m" + manifestCount.getAndIncrement())); // <= HERE
    return EncryptingFileIO.combine(ops.io(), ops.encryption())
        .newEncryptingOutputFile(manifestFileLocation);
```

For `manifestCount`:
See https://github.com/apache/iceberg/blob/apache-iceberg-1.7.1/core/src/main/java/org/apache/iceberg/SnapshotProducer.java#L111

```java
  private final AtomicInteger manifestCount = new AtomicInteger(0);
```
