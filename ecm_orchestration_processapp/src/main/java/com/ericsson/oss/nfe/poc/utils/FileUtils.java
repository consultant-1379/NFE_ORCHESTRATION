package com.ericsson.oss.nfe.poc.utils;

import java.io.BufferedReader;
import java.io.Closeable;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ericsson.oss.nfe.poc.listeners.AppConfigLoader;

public class FileUtils {
	
	private static Logger logger = LoggerFactory.getLogger(FileUtils.class);

	public static InputStream loadFile(String directory, String filename)
			throws IOException {

		logger.debug("directory : " + directory + " FileName : "
				+ filename);
		File file = new File(directory + "/" + filename);

		try {
 			return new FileInputStream(file);

		} catch (Exception e) {
			throw new IOException("FILE_READ_FAIELD",e);
		}

	}

	public static String loadFileAsString(String fileName) {
		BufferedReader reader = null;

		StringBuilder stringBuilder = new StringBuilder();
		try {
			 
			reader = new BufferedReader(new InputStreamReader(
					FileUtils.class.getClassLoader().getResourceAsStream(fileName)));
			String line = null;

			String ls = System.getProperty("line.separator");

			while ((line = reader.readLine()) != null) {
				stringBuilder.append(line);
				stringBuilder.append(ls);
			}
		} catch (Exception e) {

		}
		finally
		{
			closeFailSafe(reader);
		}

		return stringBuilder.toString();
	}
	
	public static InputStream loadFileFromAppConfig(String fileName)
	{
		
		String appconfiDir = AppConfigLoader.getAppConfigDir();
		InputStream is = null;
		if(!StringUtils.isEmpty(appconfiDir))
		{
			try {
				
				is = new FileInputStream(new File(appconfiDir+"/"+fileName));
				
			} catch (FileNotFoundException e) {
				logger.debug("File not found !! directory : " + appconfiDir + " FileName : "+fileName);
			}
		}  
		return is;
	}
	 	
	
	public static String loadStreamAsString(InputStream is) {
		BufferedReader reader = null;

		StringBuilder stringBuilder = new StringBuilder();
		try {
			 
			reader = new BufferedReader(new InputStreamReader(is));
			String line = null;

			String ls = System.getProperty("line.separator");

			while ((line = reader.readLine()) != null) {
				stringBuilder.append(line);
				stringBuilder.append(ls);
			}
		} catch (Exception e) {

		}

		return stringBuilder.toString();
	}
	
	public static void closeFailSafe(Closeable closable)
	{
		try {
			if(closable!=null)
				closable.close();
			} catch (IOException ignore) {
				logger.warn("Failsafe close of closable failed");
			}
	}

}
