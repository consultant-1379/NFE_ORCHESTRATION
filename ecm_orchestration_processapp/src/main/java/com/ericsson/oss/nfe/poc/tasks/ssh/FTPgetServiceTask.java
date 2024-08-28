package com.ericsson.oss.nfe.poc.tasks.ssh;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ericsson.oss.nfe.poc.utils.Utils;

public class FTPgetServiceTask implements JavaDelegate {

	private final Logger log = LoggerFactory.getLogger(getClass());

	public Expression remoteFilename;
	
	public Expression remoteFilepath;

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
				&& isValidExpression(remoteFilename, execution)
				&& isValidExpression(remoteFilepath, execution)) {
			
			int port = Utils.toInt(sshPortNumber.getValue(execution).toString(), 22);

			connection = new SecureShellConnectionImpl(sshUser.getValue(execution).toString(), sshPassword.getValue(execution).toString(), sshHost
					.getValue(execution).toString(), port);

			String remoteFilenameStr = (String) remoteFilename.getValue(execution);
			String remoteFilePathStr = (String) remoteFilepath.getValue(execution);

			String result = "";
			try {
				result = connection.getFile(remoteFilenameStr, remoteFilePathStr);
			}
			catch (Exception e) {
				e.printStackTrace();
			}
			finally {
				connection.disconnect();
			}
			log.info("FTP get executed and output --> " + result);

			execution.setVariable("ftpOutput", result);
		}
		else {
			throw new RuntimeException("SSH Connection details are incomplete");

		}
	}

	private boolean isValidExpression(Expression expr, DelegateExecution delegateExecution) {
		return (expr != null && (expr.getValue(delegateExecution) != null || expr.getExpressionText() != null));
	}
}
