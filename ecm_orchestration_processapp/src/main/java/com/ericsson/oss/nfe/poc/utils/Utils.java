package com.ericsson.oss.nfe.poc.utils;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Utils {
	
	private static Logger logger = LoggerFactory.getLogger(Utils.class);
	
	public static int toInt(String integerStr, int defaultVal) {
		
		int returnval = defaultVal;

	
		if (StringUtils.isNumeric(integerStr)) {
			try {
				returnval = Integer.parseInt(integerStr);
			} catch (NumberFormatException nfe) {}
		}
		return returnval;

	}
	
	
	public static String extractVDCID(String fullVDCStr)
	{
		
		if (StringUtils.isNotBlank(fullVDCStr)&& fullVDCStr.contains("("))
		{
			int strt = fullVDCStr.indexOf("(");
			int end = fullVDCStr.indexOf(")");
			return fullVDCStr.substring(strt+1, end);
			
		}
		
		return fullVDCStr;
	}
}
