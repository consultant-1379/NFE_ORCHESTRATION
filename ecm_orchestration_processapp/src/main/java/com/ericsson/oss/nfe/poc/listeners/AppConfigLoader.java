package com.ericsson.oss.nfe.poc.listeners;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.ExecutionListener;

public class AppConfigLoader implements ExecutionListener {

	
	private static final String ECM_PROPS_MAP_KEY = "ecm.props.map.";
	
	private static boolean isInit =false;

	public AppConfigLoader()
	{
		loadAppConfig();
	}
	
	private static Properties props = new Properties();
 
	public void notify(DelegateExecution execution) throws Exception {

		System.out.println(" --------------------~~ AppConfigLoader ~~---------------------------");		
		this.loadAppConfig(execution);
	}

	
	private void loadAppConfig() {

		if(!isInit)
		{
			try { 
				
				
				InputStream is = AppConfigLoader.class.getClassLoader().getResourceAsStream("./appconfig.properties");			
				props.load(is);	
				System.out.println("Set props to " + props);
				String env = getAppConfigDir();
				if ("".equalsIgnoreCase(env))
				{
					System.out.println(" Didn't find APPCONFIGDIR  in " + System.getProperties());
				}
				else
				{
					File appfile = new File(env+"/appconfig.properties");
					System.out.println(" APPCONFIGFile is " + appfile.getAbsolutePath());
					if (appfile.exists())
					{
					
						InputStream is2 = new FileInputStream(appfile);			
						props.load(is2);	
						System.out.println(" properties added from  " + appfile.getAbsolutePath() + " propos now " + props);
					}
				}
 	
			} catch (Exception e) {
				e.printStackTrace();
			}
			isInit =true;
		}
	}
	
	private void loadAppConfig(DelegateExecution execution) {

		try {
			if(!isInit)
			{
				InputStream is = AppConfigLoader.class.getClassLoader().getResourceAsStream("./appconfig.properties");			
				props.load(is);			
				System.out.println("App config successfully load ---> "+props);
			}
			
			System.out.println("App config Loading props map ");
			Map<String,String> propsMap = new HashMap<String, String>();
			
			for(Object key: props.keySet())
			{
				String strKey = (String)key;
				//if(!strKey.startsWith(ECM_PROPS_MAP_KEY))
				//{
 					propsMap.put(strKey, props.getProperty(key.toString(), ""));
					
				//}
				
			}
			
			execution.setVariable("appConfigProps", propsMap);

		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	
	public static String getProperty(String key)
	{
		return props.getProperty(key, "");
	}
	
	public static Map<String, String> getECMPropsMap()
	{
		Map<String,String> propsMap = new HashMap<String, String>();
		
		for(Object key: props.keySet())
		{
			String strKey = (String)key;
			if(strKey.startsWith(ECM_PROPS_MAP_KEY))
			{
				String chippedKey = strKey.substring(ECM_PROPS_MAP_KEY.length());
				propsMap.put(chippedKey, props.getProperty(key.toString(), ""));
				
			}
			
		}
		return propsMap;
	}
	
	
	public static String getAppConfigDir()
	{ 
		return System.getProperty("APPCONFIGDIR","");
	}
}
