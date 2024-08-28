package com.ericsson.oss.nfe.poc.listeners;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ActivityEntryExitListener implements ExecutionListener {

	private final Logger Logger = LoggerFactory.getLogger("activity-tracker");

	
	public void notify(DelegateExecution execution) throws Exception {
		
		if("start".equalsIgnoreCase(execution.getEventName()))
		{
			Logger.info("------------------- Starting Proccess ------> "+execution.getCurrentActivityName() + " process Id : "+execution.getProcessInstanceId());

		}
		else if("end".equalsIgnoreCase(execution.getEventName()))
		{
			Logger.info("------------------- Ending Proccess ------> "+execution.getCurrentActivityName()+ " process Id : "+execution.getProcessInstanceId());

		} 
 
 	}

}
