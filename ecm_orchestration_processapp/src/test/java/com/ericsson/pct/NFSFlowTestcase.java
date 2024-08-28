package com.ericsson.pct;

import java.util.HashMap;
import java.util.Map;

import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.runtime.Job;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.engine.test.Deployment;
import org.camunda.bpm.engine.test.ProcessEngineRule;
import org.junit.Rule;
import org.junit.Test;

public class NFSFlowTestcase {

	@Rule
	  public ProcessEngineRule processEngineRule = new ProcessEngineRule();

	  

	  @Test
	  @Deployment(resources = { "nfsTest.bpmn" })
	  public void testCreateVDCProcess() {

	    final RuntimeService runtimeService = processEngineRule.getRuntimeService();
	    final TaskService taskService = processEngineRule.getTaskService();

	    // this invocation should NOT fail
	    //Map<String, Object> variables = Collections.<String, Object> singletonMap("instanceType","EPG");

	    Map<String, Object> variables = new HashMap<String, Object>();
	    variables.put("instanceType", "EPG");
	    variables.put("vmip", "");
	    // start the process instance
	    ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("nfsTest", variables);
	    
	    try {
			Thread.sleep(10000);
		}
		catch (InterruptedException e) { 
			e.printStackTrace();
		}
	    
	   Job job= processEngineRule.getManagementService().createJobQuery().singleResult();
	   
	   processEngineRule.getManagementService().executeJob(job.getId());
	     
	   
	   }
}
