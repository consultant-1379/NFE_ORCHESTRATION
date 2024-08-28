package com.ericsson.oss.nfe.poc.tasks;

import java.util.ArrayList;
import java.util.List;

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
import com.ericsson.oss.nfe.poc.utils.vo.HeaderTupple;
import com.ericsson.oss.nfe.poc.utils.vo.ResponseVO;

public class GenericOpenStackRESTInvoker implements JavaDelegate {

	private final Logger log = LoggerFactory.getLogger(getClass());

	private Expression requestString;

	private Expression method;
	
	private Expression endpointURL;

	private Expression outPutVariable;
	
 
	public void execute(DelegateExecution execution) {
		
		log.info("------------------------------GenericJSONExtractor task started ----------------- ");
 		 
		doGenericRESTCall(execution);	 

		log.info("Variables" + execution.getVariables());
		
 	}

	private void doGenericRESTCall(DelegateExecution execution) {
		
		
		String inputrequest = requestString.getValue(execution).toString();

		String httpMethod = method.getValue(execution).toString();
		
		String endpointURLStr = endpointURL.getValue(execution).toString();		

		String outputVarName = outPutVariable.getExpressionText(); 
		
		String responseStr = "";
 		execution.setVariable("restCallPass", false);
		
		if(StringUtils.isEmpty(httpMethod)|| StringUtils.isEmpty(endpointURLStr))
			throw new RuntimeException("URL and http method is required");
		
		List<HeaderTupple> headers = new ArrayList<HeaderTupple>();
		
		String xauthHeader = (String)execution.getVariable("osauthToken");
		if(!StringUtils.isEmpty(xauthHeader))
		{
			HeaderTupple ht = new HeaderTupple("X-Auth-Token", xauthHeader);
			headers.add(ht);
		}
		
		if(ECMConstants.GET_METHOD.equalsIgnoreCase(httpMethod))
		{
			
			try {
				responseStr = new RESTUtil().doGETRequest(endpointURLStr,headers);
				execution.setVariable("restCallPass", true);
			} catch (RESTInvokeException e) {
				throw new RuntimeException("Error in rest get",e);
			}
			
		}
		else if(ECMConstants.POST_METHOD.equalsIgnoreCase(httpMethod))
		{
			try
			{
				responseStr = new RESTUtil().doPOSTRequest(inputrequest, endpointURLStr,headers);
				execution.setVariable("restCallPass", true);
				
			} catch (RESTInvokeException e) {
				throw new RuntimeException("Error in rest get",e);
			}
		}
		else if(ECMConstants.DELETE_METHOD.equalsIgnoreCase(httpMethod))
		{
			
		}
		else
			throw new RuntimeException("Http method is invalid ");
		 	
		 
		execution.setVariable(outputVarName, responseStr);
	}
	
	 
}