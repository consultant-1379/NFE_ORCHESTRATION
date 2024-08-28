package com.ericsson.oss.nfe.poc.tasks.ssh;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ericsson.oss.nfe.poc.listeners.AppConfigLoader;
import com.ericsson.oss.nfe.poc.utils.FileUtils;
import com.floreysoft.jmte.Engine;

public class BuildXMLServiceTask implements JavaDelegate {

	private final Logger log = LoggerFactory.getLogger(getClass());
	
	public Expression filename;
	public Expression vmip;

	public void execute(DelegateExecution delegateExecution) throws Exception {

		String fileNameStr = (String) filename.getValue(delegateExecution);
		String vmIP_Str = "";
		if(vmip!=null)
		 vmIP_Str = (String) vmip.getValue(delegateExecution);
 		log.info("Searching the file: " + fileNameStr);
		_getfile(fileNameStr, vmIP_Str);
	}

	private void _getfile(String fileNameStr, String vmIP_Str) {

		Engine engine = new Engine();
		Map<String, Object> model = new HashMap<String, Object>();
		model.put("vmip", vmIP_Str);

		InputStream is =   FileUtils.loadFileFromAppConfig(fileNameStr);
		String template = null;
		if(is!=null)
		{
			template = FileUtils.loadStreamAsString(is);
			String output = engine.transform(template, model);
			//System.out.println(output);
			_buildXMLFile(output);
		}
		else
			throw new RuntimeException("Error getting the file :"+fileNameStr +" from appconfig dir");
		
	}

	private void _buildXMLFile(String data) {
		FileWriter fw = null;
		try {
			
			String tempDir = AppConfigLoader.getAppConfigDir();
			File f = new File(tempDir+"/sample.xml");
			fw = new FileWriter(f);
			fw.write(data.replaceAll("\r\n", "\n"));
		}
		catch (IOException e) {
			log.error("Failed to build the file: sample.xml",e);
			throw new RuntimeException("Failed to build the ORNM Input file");
		}
		finally {
			if (fw != null)
				try {
					fw.close();
				}
				catch (IOException ignore) {
				}
		}
		log.info("sample.xml created successfully");
	}
}
