package com.ericsson.oss.nfe.poc.tasks;

import static com.ericsson.oss.nfe.poc.core.ApplicationConstants.ECM_NAMEID_MAP;

import java.util.HashMap;
import java.util.Map;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ericsson.oss.nfe.poc.core.ApplicationConstants;
import com.ericsson.oss.nfe.poc.core.RESTInvokeException;
import com.ericsson.oss.nfe.poc.listeners.AppConfigLoader;
import com.ericsson.oss.nfe.poc.utils.JSONTemplateBuilder;
import com.floreysoft.jmte.Engine;

public class OffertoRequestBuilder implements JavaDelegate {

	private final Logger log = LoggerFactory.getLogger(getClass());

	private Expression requestTemplate;
	
	private Expression vdcName;
 
	private Expression outPutVariable;

	public void execute(DelegateExecution execution) {
		
		log.info("------------------------------OffertoRequestBuilder task started ----------------- ");

		String inputJson = requestTemplate.getValue(execution).toString();
		String requestJSONTemplate = null;
		log.info("inputJson : "+inputJson);
		try {
			 requestJSONTemplate = JSONTemplateBuilder.buildTemplateResponse(inputJson);
			
		} catch (RESTInvokeException e) {
			log.error("Exeception building template");
			throw new RuntimeException(e);
		}
		
		log.info("requestJSONTemplate : "+requestJSONTemplate);
		
		//Get the map of VDC,VNs,VMS etc populated from previous get
		Map<String, String> ecmProcessIDMap = (Map<String, String>) execution
				.getVariable(ECM_NAMEID_MAP);
		
		ecmProcessIDMap = (ecmProcessIDMap!=null?ecmProcessIDMap:new HashMap<String, String>());
		
		if(isValidExpression(vdcName,execution))
		{
			String vdcNameStr =  vdcName.getValue(execution).toString();
			ecmProcessIDMap.put(ApplicationConstants.VDC_NAME_PLACHEHOLDER, vdcNameStr);
			System.out.println("----------------------vdcNameStr ---------------------------------------"+vdcNameStr);
		}
		else
		{
			ecmProcessIDMap.put(ApplicationConstants.VDC_NAME_PLACHEHOLDER,"EPG-VDC");
		}
		
		
		String filledReq = null;
		if(requestJSONTemplate!=null)
			filledReq = buildAndPopulateTemplates(requestJSONTemplate,ecmProcessIDMap);
 
 
		log.info("filledReq : "+filledReq);
		
		String outputVarName = outPutVariable.getExpressionText();
		
		execution.setVariable(outputVarName, filledReq); 
 
		log.info("------------------------------OffertoRequestBuilder task Ended ----------------- ");

	}
	
	
	private String buildAndPopulateTemplates(String jsonTemplate,Map<String, String> execVars) 
	{
		Engine engine = new Engine();		 	 
		Map<String, Object> tokens = new HashMap<String, Object>();
		
		if(execVars!=null)
			tokens.putAll(execVars);
		
		Map<String, String> ecmPropsMaps =AppConfigLoader.getECMPropsMap();
		
		System.out.println("ecmPropsMaps --> "+ecmPropsMaps);
		
		for(Map.Entry<String, String> entry:ecmPropsMaps.entrySet())
			tokens.put(entry.getKey(), entry.getValue());		
		 
 		 String transformed = engine.transform(jsonTemplate, tokens);
 		
		return transformed;
	}
	
	private boolean isValidExpression(Expression expr, DelegateExecution delegateExecution) {
		return (expr != null && (expr.getValue(delegateExecution) != null || expr.getExpressionText() != null));
	}
}