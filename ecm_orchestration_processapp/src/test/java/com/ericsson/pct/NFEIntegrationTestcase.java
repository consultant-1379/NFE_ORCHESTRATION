package com.ericsson.pct;

import java.util.HashMap;
import java.util.Map;

import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.runtime.Job;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.engine.test.Deployment;
import org.camunda.bpm.engine.test.ProcessEngineRule;
import org.junit.Rule;
import org.junit.Test;

public class NFEIntegrationTestcase {

	 
	@Rule
	  public ProcessEngineRule processEngineRule = new ProcessEngineRule();
  
	  
 	  @Test
	// @Deployment(resources = { "updateexstreamswitch.bpmn","updateonrm.bpmn","createVDC.bpmn","createEPGNFSVMS.bpmn","createEPGVM.bpmn","nfe_e2e_orchestration.bpmn" })
 	  @Deployment(resources = {"createVDC.bpmn"})
	  public void testCallActivity() {

	    final RuntimeService runtimeService = processEngineRule.getRuntimeService();
 
	    // this invocation should NOT fail
	    Map<String, Object> variables = new HashMap<String, Object>();
	    variables.put("instanceType","EPG");
	    variables.put("VDCName","TEST-VDC");
	    variables.put("nfsvmip","atvts835.athtem.eei.ericsson.se");

	    // start the process instance
	    ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("createVDC", variables);	  
	    
	    try {
			Thread.sleep(60000);
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	    
	    Job job= processEngineRule.getManagementService().createJobQuery().singleResult();
		   
		processEngineRule.getManagementService().executeJob(job.getId());
	   
	   } 
 	   
 	  
}
