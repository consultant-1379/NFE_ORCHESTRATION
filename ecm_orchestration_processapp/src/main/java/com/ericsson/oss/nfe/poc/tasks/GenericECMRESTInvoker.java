package com.ericsson.oss.nfe.poc.tasks;

import org.apache.commons.lang.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ericsson.oss.nfe.poc.core.RESTInvokeException;
import com.ericsson.oss.nfe.poc.utils.ECMConstants;
import com.ericsson.oss.nfe.poc.utils.ECMRESTUtil;
import com.ericsson.oss.nfe.poc.utils.RESTUtil;
import com.ericsson.oss.nfe.poc.utils.vo.ResponseVO;

public class GenericECMRESTInvoker implements JavaDelegate {

	private final Logger log = LoggerFactory.getLogger(getClass());

	private Expression requestString;

	private Expression method;
	
	private Expression endpointURL;

	private Expression outPutVariable;
	
 
	public void execute(DelegateExecution execution) {
		
		log.info("------------------------------GenericECMRESTInvoker task started ----------------- ");
 		 
		doECMRESTCall(execution);	 

		log.info("Variables" + execution.getVariables());
		
 	} 
	
	private void doECMRESTCall(DelegateExecution execution) {
		String inputrequest = requestString.getValue(execution).toString();

		String httpMethod = method.getValue(execution).toString();
		
		String endpointURLStr = endpointURL.getValue(execution).toString();		

		String outputVarName = outPutVariable.getExpressionText(); 
		
		ResponseVO response = null;
		execution.setVariable("restCallPass", false);
		
		if(StringUtils.isEmpty(httpMethod)|| StringUtils.isEmpty(endpointURLStr))
			throw new RuntimeException("URL and http method is required");
		
		 
		if(ECMConstants.GET_METHOD.equalsIgnoreCase(httpMethod))
		{
			
			try {
				response = new ECMRESTUtil().doGETRequest(endpointURLStr);
				execution.setVariable("restCallPass", true);
			} catch (RESTInvokeException e) {
				throw new RuntimeException("Error in rest get"+response);
			}
			
		}
		else if(ECMConstants.POST_METHOD.equalsIgnoreCase(httpMethod))
		{
			try
			{
				response = new ECMRESTUtil().doPOSTRequest(inputrequest, endpointURLStr);
				execution.setVariable("restCallPass", true);
				
			} catch (RESTInvokeException e) {
				throw new RuntimeException("Error in rest get"+response);
			}
		}
		else if(ECMConstants.DELETE_METHOD.equalsIgnoreCase(httpMethod))
		{
			
		}
		else
			throw new RuntimeException("Http method is invalid ");
		
		
		System.out.println("REST RESponse "+response);
		execution.setVariable(outputVarName, response);
	}
}