package com.lessons.services;

import org.apache.commons.io.FileUtils;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;

@Service
public class FileService {

    public void deleteFileInFileSystemIfExists(String aFilePath) {
        // Delete file if it exists
        File file = new File(aFilePath);
        if (file.exists()) {
            boolean deleteSucceeded = FileUtils.deleteQuietly(file);
            if (!deleteSucceeded) {
                throw new RuntimeException("Error in deleteFileInFileSystemIfExists():  I failed to delete this file: " + aFilePath);
            }
        }
    }


    public void addFileToRegularFilesystem(InputStream aInputStream, String aDestinationFilePath) throws Exception {
        deleteFileInFileSystemIfExists(aDestinationFilePath);

        createDirectoryIfNotExists(aDestinationFilePath);

        // Get a file object that references the destination
        File destinationFile = new File(aDestinationFilePath);

        // Write the file to the regular file system
        Files.copy(aInputStream, destinationFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
    }



    public void createDirectoryIfNotExists(String aDestinationFilePath) {
        File dir = new File(aDestinationFilePath);

        if (dir == null) {
            throw new RuntimeException("Error in createDirectoryIfNotExists():  Passed-in file object is null.");
        }
        if (dir.exists()) {
            if (!dir.isDirectory()) {
                throw new RuntimeException("Error in createDirectoryIfNotExists(): output directory is not valid");
            }
        } else {
            if (!dir.mkdirs()) {
                throw new RuntimeException("Error in createDirectoryIfNotExists():  Cannot create output directories");
            }
        }
    }
}
