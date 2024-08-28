package com.ericsson.pct;

import static com.ericsson.oss.nfe.poc.tasks.ssh.SecureShellConnection.CONNECTION_HOST;
import static com.ericsson.oss.nfe.poc.tasks.ssh.SecureShellConnection.CONNECTION_PORT;
import static com.ericsson.oss.nfe.poc.tasks.ssh.SecureShellConnection.PASSWORD;
import static com.ericsson.oss.nfe.poc.tasks.ssh.SecureShellConnection.USERNAME;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.HashMap;
import java.util.Map;

import org.camunda.bpm.engine.test.ProcessEngineRule;
import org.camunda.bpm.model.bpmn.Bpmn;
import org.camunda.bpm.model.bpmn.BpmnModelInstance;
import org.junit.Rule;
import org.junit.Test;

public class FTPServiceTaskTest {

	@Rule
	public ProcessEngineRule processEngineRule = new ProcessEngineRule();

	@Test
	public void testServiceTask() {
		final String classname = "com.ericsson.oss.nfe.poc.tasks.ssh.FTPServiceTask";

		BpmnModelInstance modelInstance = Bpmn.createExecutableProcess("testProcess")
	    	    .name("TestServiceTask").executable()	    	    
	    	  .startEvent()
	    	 .serviceTask()
	    	 .name("TestserviceTask")
	    	 .camundaClass(classname)
	    	  .endEvent()
	    	  .done();

		ByteArrayOutputStream out = new ByteArrayOutputStream();
		Bpmn.writeModelToStream(out, modelInstance);
		ByteArrayInputStream is = new ByteArrayInputStream(out.toByteArray());

		try {
			processEngineRule.getRepositoryService().createDeployment().addInputStream("testserviceTask.bpmn", is).deploy();
		}
		catch (Exception ignore) {
		}
		// start process model
		// System.out.println(processEngineRule.getManagementService().getRegisteredDeployments());

		Map<String, Object> variables = new HashMap<String, Object>();
		variables.put("srcFilePath", "sample.xml");
		variables.put("destFilePath", "tmp");
		variables.put("sshHost", CONNECTION_HOST);
		variables.put("sshPortNumber", CONNECTION_PORT);
		variables.put("sshUser", USERNAME);
		variables.put("sshPassword", PASSWORD);

		processEngineRule.getRuntimeService().startProcessInstanceByKey("testProcess", variables);
	}
}
