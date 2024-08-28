package com.ericsson.oss.nfe.poc.tasks;

//import org.camunda.bpm.engine.delegate.BpmnError;
import java.util.HashMap;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class GenericLogTask implements JavaDelegate {
	private final Logger log = LoggerFactory.getLogger(getClass());

	private static HashMap <String,Integer> potentialLeak = new HashMap <String,Integer>();
	// ${name}
	/*
	 * @Override public void executeTask(final TaskExecution execution) throws
	 * WorkflowServiceException {
	 * 
	 */
	
	private Expression nodeName;
	
	public void execute(DelegateExecution execution) throws Exception{

		String loggingNode = "";
		if(nodeName!=null)
		{
			loggingNode =  nodeName.getValue(execution).toString();
		}
		
		log.info("------------------------------GenericLogTask task "+loggingNode +" started ----------------- "
				+ execution.getProcessDefinitionId()
				+ "[ "
				+ execution.getProcessInstanceId() + " ]");
		

		System.out.println("------------------------------GenericLogTask task "+loggingNode +" started ----------------- "
				+ execution.getProcessDefinitionId()
				+ "[ "
				+ execution.getProcessInstanceId() + " ]");
		 

		System.out.println("Time[ " +System.currentTimeMillis() + " ] Variables : "+ execution.getVariable("counter"));

		log.info("------------------------------GenericLogTask task "+loggingNode +" ended ----------------- ");
	
		/*Integer counter = (Integer)potentialLeak.get(execution.getProcessInstanceId()+"-counter");
		if (counter == null)
		{
			counter = new Integer(0);
		}
		counter = counter + 1;
		potentialLeak.put(execution.getProcessInstanceId()+"-counter",counter);
		if (counter < 4)
		{
			throw new Exception("exception  " + counter);
		}*/
	}

}