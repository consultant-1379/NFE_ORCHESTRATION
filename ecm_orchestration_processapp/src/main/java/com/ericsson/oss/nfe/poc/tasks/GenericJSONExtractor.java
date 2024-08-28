package com.ericsson.oss.nfe.poc.tasks;

import org.apache.commons.lang.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.jayway.jsonpath.JsonPath;

public class GenericJSONExtractor implements JavaDelegate {
	
	private final Logger log = LoggerFactory.getLogger(getClass());

	private Expression inputExpr;

	private Expression jsonPath;
	 
	private Expression outPutVariable;
	 
	public void execute(DelegateExecution execution) {
		 	
		log.info("------------------------------GenericJSONExtractor task started ----------------- "+execution.getProcessDefinitionId()+"[ "+execution.getProcessInstanceId()+ " ]");
		
		String inputJson = inputExpr.getValue(execution).toString();
		
		String jsonPathExpr = jsonPath.getValue(execution).toString();
		
		String outputVarName = outPutVariable.getExpressionText();		
 		
		execution.setVariable(outputVarName, extractJSON(inputJson,jsonPathExpr));
		
		System.out.println("Variables"+execution.getVariables());
	 
		
		log.info("------------------------------GenericJSONExtractor task Ended ----------------- "+execution.getProcessDefinitionId()+"[ "+execution.getProcessInstanceId()+ " ]");
	}
 	 
	private Object extractJSON(String input,String expr)
	{
		Object results ="";
		if(!StringUtils.isEmpty(input)&& !StringUtils.isEmpty(expr))
			 results = JsonPath.read(input, expr);
		return results;
	}
	
	public Expression getInputExpr() {
		return inputExpr;
	}

	public void setInputExpr(Expression inputExpr) {
		this.inputExpr = inputExpr;
	}

	public Expression getJsonPath() {
		return jsonPath;
	}

	public void setJsonPath(Expression jsonPath) {
		this.jsonPath = jsonPath;
	}

	public Expression getOutPutVariable() {
		return outPutVariable;
	}

	public void setOutPutVariable(Expression outPutVariable) {
		this.outPutVariable = outPutVariable;
	}
 
	 
}