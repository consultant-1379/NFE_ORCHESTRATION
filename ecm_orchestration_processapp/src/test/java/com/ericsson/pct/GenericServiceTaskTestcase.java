package com.ericsson.pct;

import java.util.HashMap;
import java.util.Map;

import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.engine.test.Deployment;
import org.camunda.bpm.engine.test.ProcessEngineRule;
import org.junit.Rule;
import org.junit.Test;

public class GenericServiceTaskTestcase {

	@Rule
	public ProcessEngineRule processEngineRule = new ProcessEngineRule();

	@Test
	@Deployment(resources = { "TestServiceTask.bpmn" })
	public void testTask() {

		final RuntimeService runtimeService = processEngineRule.getRuntimeService();
		final TaskService taskService = processEngineRule.getTaskService();

		Map<String, Object> variables = new HashMap<String, Object>();
		variables.put("testFor", "script");

		ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("test", variables);

	}
}
