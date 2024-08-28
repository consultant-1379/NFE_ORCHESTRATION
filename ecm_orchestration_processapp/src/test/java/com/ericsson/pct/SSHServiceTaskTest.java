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
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;

public class SSHServiceTaskTest {

	@Rule
	public ProcessEngineRule processEngineRule = new ProcessEngineRule();
	
	@Before
	/*public void createModel() {
		final String classname = "com.ericsson.oss.nfe.poc.tasks.ssh.SSHServiceTask";
		BpmnModelInstance modelInstance = Bpmn.createProcess("testProcess").startEvent().serviceTask("testTask").camundaClass(classname).endEvent()
				.done();
		
		Bpmn.validateModel(modelInstance);

		File file = new File("src//main//resources//testModel.bpmn");
		try {
			file.createNewFile();
			System.out.println("file-created");
		}
		catch (IOException ignore) {
			System.out.println("file-not-created");
		}
		finally {
			//file.deleteOnExit();
			System.out.println("file-deleted");
		}
		Bpmn.writeModelToFile(file, modelInstance);
		
		ByteArrayOutputStream out = new ByteArrayOutputStream();	    
	    Bpmn.writeModelToStream(out, modelInstance); 
	    ByteArrayInputStream is = new ByteArrayInputStream(out.toByteArray());
	    
		//processEngineRule.getRepositoryService().createDeployment().addClasspathResource("testModel.bpmn").deploy();
	}*/

	/*@Test
	public void testSevicetask() {
		
		//createModel();

		final RuntimeService runtimeService = processEngineRule.getRuntimeService();
		final TaskService taskService = processEngineRule.getTaskService();

		Map<String, Object> variables = new HashMap<String, Object>();
		variables.put("srcFilePath", "");
		variables.put("destFilePath", "");
		variables.put("sshHost", CONNECTION_HOST);
		variables.put("sshPortNumber", CONNECTION_PORT);
		variables.put("sshUser", USERNAME);
		variables.put("sshPassword", PASSWORD);
		
		ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("testProcess", variables);

		Job job = processEngineRule.getManagementService().createJobQuery().singleResult();
		processEngineRule.getManagementService().executeJob(job.getId());

	}*/
	
	@Test
	public void testServiceTask() {
		final String classname = "com.ericsson.oss.nfe.poc.tasks.ssh.SSHServiceTask";
		
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
		} catch (Exception ignore) {
		}
	    // start process model
	    //System.out.println(processEngineRule.getManagementService().getRegisteredDeployments());
	    
	    Map<String, Object> variables = new HashMap<String, Object>();
		variables.put("command", "ls /tmp");
		variables.put("sshHost", "localhost");
		variables.put("sshPortNumber", 22);
		variables.put("sshUser", "anauser");
		variables.put("sshPassword", "gravity");
		
	    processEngineRule.getRuntimeService().startProcessInstanceByKey("testProcess", variables);
	}

}
