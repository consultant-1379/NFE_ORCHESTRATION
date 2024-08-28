package com.ericsson.pct;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Collections;
import java.util.Map;

import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.runtime.Job;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.engine.task.Task;
import org.camunda.bpm.engine.test.Deployment;
import org.camunda.bpm.engine.test.ProcessEngineRule;
import org.camunda.bpm.model.bpmn.Bpmn;
import org.camunda.bpm.model.bpmn.BpmnModelInstance;
import org.junit.Ignore;
import org.junit.Rule;
import org.junit.Test;

public class SimpleBPMNTestcase {

	 
	@Rule
	  public ProcessEngineRule processEngineRule = new ProcessEngineRule();

	  

	@Ignore @Test
	  @Deployment(resources = { "createVDC.bpmn" })
	  public void testCreateVDCProcess() {

	    final RuntimeService runtimeService = processEngineRule.getRuntimeService();
	    final TaskService taskService = processEngineRule.getTaskService();

	    // this invocation should NOT fail
	    Map<String, Object> variables = Collections.<String, Object> singletonMap("instanceType","EPG");

	    // start the process instance
	    ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("createVDC", variables);
	    
	    
	   Job job= processEngineRule.getManagementService().createJobQuery().singleResult();
	   
	   processEngineRule.getManagementService().executeJob(job.getId());	     
	   
	   }
	   
	   
	   
	  @Test
		 @Deployment(resources = { "deleteResources.bpmn" })
		  public void testCompensation() {

		    final RuntimeService runtimeService = processEngineRule.getRuntimeService();

		    // this invocation should NOT fail
		    Map<String, Object> variables = Collections.<String, Object> singletonMap("instanceType","EPG");

		    // start the process instance
		    ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("delete_resources", variables);
		    
		    
		   Task task =  processEngineRule.getTaskService().createTaskQuery().singleResult();
		   
		   variables = Collections.<String, Object> singletonMap("deleteConf",Boolean.TRUE);
		  
		   processEngineRule.getTaskService().complete(task.getId(), variables);
		 
		   
		   }
	  
	 @Ignore @Test
	  @Deployment(resources = { "createEPGNFSVMS.bpmn" })
	  public void testCreateVMSProcess() {

	    final RuntimeService runtimeService = processEngineRule.getRuntimeService();
	    final TaskService taskService = processEngineRule.getTaskService();

	    // this invocation should NOT fail
	    Map<String, Object> variables = Collections.<String, Object> singletonMap("instanceType","EPG");

	    // start the process instance
	    ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("createvms", variables);
	     
	    
	     Job job= processEngineRule.getManagementService().createJobQuery().singleResult();
		   
		   processEngineRule.getManagementService().executeJob(job.getId());
	     
	   
	   }
	 
	  
	  //Testing progress annotation for parent and sample flows
	 @Ignore@Test
	  @Deployment(resources = { "parent_flow.bpmn","sample.bpmn" })
	  public void testCallActivity() {

	    final RuntimeService runtimeService = processEngineRule.getRuntimeService();
 
	    // this invocation should NOT fail
	    Map<String, Object> variables = Collections.<String, Object> singletonMap("instanceType","EPG");

	    // start the process instance
	    ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("parent_flow", variables);	      
	   
	   }
	 
	 
	  @Ignore @Test
	  @Deployment(resources = { "updateexstreamswitch.bpmn"})
	  public void testUpdateExtremeSwitch() {

	    final RuntimeService runtimeService = processEngineRule.getRuntimeService();

	    // this invocation should NOT fail
	    Map<String, Object> variables = Collections.<String, Object> singletonMap("instanceType","EPG");

	    // start the process instance
	    ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("updateextremeswitch", variables);	      
	   
	   }
	  
	 
	 @Ignore @Test
	  @Deployment(resources = { "createEPGVM.bpmn"})
	  public void testCreateEPG() {

	    final RuntimeService runtimeService = processEngineRule.getRuntimeService();

	    // this invocation should NOT fail
	    Map<String, Object> variables = Collections.<String, Object> singletonMap("vmSize","tiny");

	    // start the process instance
	    ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("createepgvms", variables);	   
	    
	    Job job= processEngineRule.getManagementService().createJobQuery().singleResult();
		   
		   processEngineRule.getManagementService().executeJob(job.getId());
	   
	   }
	  
	  
	  @Ignore @Test
 	  public void testServiceTask() {

	    BpmnModelInstance modelInstance = Bpmn.createExecutableProcess("testserviceTask")
	    	    .name("Testservice Task process").executable()	    	    
	    	  .startEvent()
	    	 .serviceTask()
	    	 .name("TestserviceTask")
	    	 .camundaClass("com.ericsson.oss.nfe.poc.tasks.QuerryAndPopulateOrderItems")
	    	  .endEvent()
	    	  .done();
	   
	    ByteArrayOutputStream out = new ByteArrayOutputStream();	    
	    Bpmn.writeModelToStream(out, modelInstance); 
	    ByteArrayInputStream is = new ByteArrayInputStream(out.toByteArray());
	    
	    
	    try {
			processEngineRule.getRepositoryService().createDeployment().addInputStream("testserviceTask.bpmn", is).deploy();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	      // start process model
	    
	    //System.out.println(processEngineRule.getManagementService().getRegisteredDeployments());
	    processEngineRule.getRuntimeService().startProcessInstanceByKey("testserviceTask");
	     
	   
	   }
	  
	  //
}
