package com.ericsson.oss.nfe.poc.tasks.ssh;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ericsson.oss.nfe.poc.utils.Utils;

public class FTPServiceTask implements JavaDelegate {

	private final Logger log = LoggerFactory.getLogger(getClass());

	public Expression srcFilePath;

	public Expression destFilePath;

	public Expression sshHost;

	public Expression sshPortNumber;

	public Expression sshUser;

	public Expression sshPassword;

	SecureShellConnectionImpl connection;

	public void execute(DelegateExecution execution) throws Exception {

		if (isValidExpression(sshHost, execution) 
				&& isValidExpression(sshPortNumber, execution) 
				&& isValidExpression(sshUser, execution)
				&& isValidExpression(sshPassword, execution) 
				&& isValidExpression(srcFilePath, execution)
				&& isValidExpression(destFilePath, execution)) {

			String fileNameStr = (String) srcFilePath.getValue(execution);
			
			if (fileNameStr.contains(",")) {
				String[] filenameArray = fileNameStr.split(",");
				for (String file : filenameArray) {
					file = file.trim();
					fileFTP(execution, file);
				}
			}
			else {
				fileFTP(execution, fileNameStr);
			}
		}
		else {
			execution.setVariable("transfer_success", Boolean.FALSE);
			throw new RuntimeException("SSH-FTP Connection details are incomplete");
		}
	}

	private void fileFTP(DelegateExecution execution, String fileNameStr) {
		
		String destinationPath = (String) destFilePath.getValue(execution);
		//String knownHost = AppConfigLoader.getProperty("known_hosts");
		int port = Utils.toInt(sshPortNumber.getValue(execution).toString(), 22);
		
		
		String userName =sshUser.getValue(execution).toString().trim();
		String pasword = sshPassword.getValue(execution).toString().trim();
		String host = sshHost.getValue(execution).toString().trim();
		
		log.debug("FTP TASK SSH to Host :"+host+" User:"+userName+"on Port :"+port + "using Password :"+pasword);

		connection = new SecureShellConnectionImpl(userName, pasword, host, port);

		log.info("File " + fileNameStr + " being ftp to " + destinationPath);

		try {
			connection.sendFile(fileNameStr, destinationPath);
			/*
			 * To test the success
			 */
			//String result = connection.sendCommand("cd " + destinationPath + "; ls");
			/*if(checkSuccess(result, fileNameStr)){
				execution.setVariable("transfer_success", checkSuccess(result, fileNameStr));
				log.info("File transferred");
			}*/
			
			execution.setVariable("transfer_success", Boolean.TRUE);
		} catch (Exception ignore) {
			System.err.println("Exception!");
		}
		finally {
			connection.disconnect();
		}
	}

	@Deprecated
	public String connectionStatus() {
		if (connection.isConnected()) {
			return "connected";
		}
		else {
			return "not-connected";
		}
	}

	public Boolean checkSuccess(String result, String filename) {
		if (result.contains(filename)) {
			return Boolean.TRUE;
		}
		else {
			return Boolean.FALSE;
		}
	}

	private boolean isValidExpression(Expression expr, DelegateExecution delegateExecution) {
		return (expr != null && (expr.getValue(delegateExecution) != null || expr.getExpressionText() != null));
	}
}
