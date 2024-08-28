package com.ericsson.oss.nfe.poc.tasks.script;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ericsson.oss.nfe.poc.utils.FileUtils;

public class GenericScriptTask implements JavaDelegate {

	private final Logger log = LoggerFactory.getLogger(getClass());
	
	public Expression file;
	
	public Expression language;
	
	public void execute(DelegateExecution execution) throws Exception {
		
		if (isValidExpression(file, execution) &&
				isValidExpression(language, execution)) {
			
		String languageStr = ((String) language.getValue(execution)).trim();
		
		String scriptFile = ((String) file.getValue(execution)).trim();
		
		ScriptEngineManager factory = new ScriptEngineManager();
		
		ScriptEngine engine = factory.getEngineByName(languageStr);
		
		String script = FileUtils.loadStreamAsString(FileUtils.loadFileFromAppConfig(scriptFile));
		
		log.info("running " + languageStr + "-script from file- " + scriptFile + ":\n" + script);
		
		engine.put("execution", execution);
		
		engine.eval(script);
		
		}
		else {
			
			throw new RuntimeException("Script task details are incomplete");

		}
	}
	
	private boolean isValidExpression(Expression expr, DelegateExecution delegateExecution) {
		
		return (expr != null && (expr.getValue(delegateExecution) != null || expr.getExpressionText() != null));
		
	}
}
