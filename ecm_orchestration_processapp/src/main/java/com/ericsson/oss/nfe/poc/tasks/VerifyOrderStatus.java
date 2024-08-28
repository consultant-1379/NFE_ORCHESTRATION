package com.ericsson.oss.nfe.poc.tasks;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ericsson.oss.nfe.poc.listeners.AppConfigLoader;
import com.ericsson.oss.nfe.poc.utils.ECMRESTUtil;
import com.ericsson.oss.nfe.poc.utils.vo.ResponseVO;
import com.floreysoft.jmte.Engine;
import com.jayway.jsonpath.JsonPath;

public class VerifyOrderStatus implements JavaDelegate {

	private final Logger log = LoggerFactory.getLogger(getClass());

	private Expression inputcreateOrderResponse;
 
	private Expression outPutVariable;

	public void execute(DelegateExecution execution) {
		
		log.info("------------------------------VerifyOrderStatus task started ----------------- ");

		ResponseVO inputJsonResponse = (ResponseVO)inputcreateOrderResponse.getValue(execution);
 		
		 String orderStatus = null;
		try 
		{
		if(inputJsonResponse!=null && !StringUtils.isEmpty(inputJsonResponse.getJsonStr())) 			 
		{
			
		  
		 String orderId = JsonPath.read(inputJsonResponse.getJsonStr(),
					"$.order.id");
		 
		 if(StringUtils.isEmpty(orderId))
				throw new RuntimeException("Error processing order no order id created");
		 
		
		 execution.setVariable("orderId", orderId);
		 
		 //Now get the orders
		 String getOrderurl = AppConfigLoader.getProperty("BASE_ECM_URL")+"/orders/"+orderId;
		 
		 
		 ResponseVO getOrderResponse = new ECMRESTUtil().doGETRequest(getOrderurl);
		 
		 orderStatus = JsonPath.read(getOrderResponse.getJsonStr(),
					"$.order.provisioningStatus");		
		 
		 log.debug("Successfully extracted order details for id : "+orderId + " status : "+orderStatus);
		 
		 execution.setVariable("orderStatus", orderStatus);		 
		 
		 System.out.println(" orderId : "+orderId + "orderStatus : "+orderStatus);
			
		}
			 
			
		} catch (Exception e) {
			log.error("Exeception building template");
			throw new RuntimeException(e);
		}
		 	
		if(outPutVariable!=null)
		{		
		
			String outputVarName = outPutVariable.getExpressionText();
			execution.setVariable(outputVarName, orderStatus);
			
		}
  
		log.info("------------------------------VerifyOrderStatus task Ended ----------------- ");

	}
	
	
	private String buildAndPopulateTemplates(String jsonTemplate,Map<String, Object> execVars) 
	{
		Engine engine = new Engine();		 	 
		Map<String, Object> tokens = new HashMap<String, Object>();
		tokens.putAll(execVars);
		
		Map<String, String> ecmPropsMaps =AppConfigLoader.getECMPropsMap();
		
		System.out.println("ecmPropsMaps --> "+ecmPropsMaps);
		
		for(Map.Entry<String, String> entry:ecmPropsMaps.entrySet())
			tokens.put(entry.getKey(), entry.getValue());		
		 
 		 String transformed = engine.transform(jsonTemplate, tokens);
 		
		return transformed;
	}
}