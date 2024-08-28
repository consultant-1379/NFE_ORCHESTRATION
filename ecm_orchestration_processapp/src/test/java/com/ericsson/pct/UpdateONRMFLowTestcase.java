package com.ericsson.pct;

import java.util.Collections;
import java.util.Map;

import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.engine.test.Deployment;
import org.camunda.bpm.engine.test.ProcessEngineRule;
import org.junit.Rule;
import org.junit.Test;

public class UpdateONRMFLowTestcase {

	 
	@Rule
	  public ProcessEngineRule processEngineRule = new ProcessEngineRule();

	  

	  @Test
	  @Deployment(resources = { "TestServiceTask.bpmn" })
	  public void testCreateVDCProcess() {

	    final RuntimeService runtimeService = processEngineRule.getRuntimeService();
	    final TaskService taskService = processEngineRule.getTaskService();

	    // this invocation should NOT fail
	    Map<String, Object> variables = Collections.<String, Object> singletonMap("testFor","SSH");

	    // start the process instance
	    ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("test", variables);
	    
	    
	  /* Job job= processEngineRule.getManagementService().createJobQuery().singleResult();
	   
	   processEngineRule.getManagementService().executeJob(job.getId());*/
	     
	   
	   }
	 
}
