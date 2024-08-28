package com.ericsson.oss.nfe.poc.tasks.ssh;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ericsson.oss.nfe.poc.listeners.AppConfigLoader;
import com.jcraft.jsch.Channel;
import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.Session;
import com.jcraft.jsch.SftpException;

public class SecureShellConnectionImpl implements SecureShellConnection {

	SSHConnection connectionInstance;

	public SecureShellConnectionImpl() {
		connectionInstance = new SSHConnection(USERNAME, PASSWORD, CONNECTION_HOST, CONNECTION_PORT);
		connect();
	}

	public SecureShellConnectionImpl(String username, String password, String host, int port) {
		connectionInstance = new SSHConnection(username, password, host, port);
		connect();
	}

	public SSHConnection getConnectionInstance() {
		return connectionInstance;
	}

	public void disconnect() {
		connectionInstance.disconnect();
	}

	public String sendCommand(String command) {
		String result = connectionInstance._sendCommand(command);
		return result;
	}

	public void sendFile(String filename, String destinationDirectory) {
		connectionInstance._sendFile(filename, destinationDirectory);
	}
	
	public String getFile(String remoteFilename, String remoteFilepath) {
		return connectionInstance._getFile(remoteFilename, remoteFilepath);
	}
	
	public void connect() {
		String errorMessage = connectionInstance._connect();
		if (errorMessage != null) {
			System.out.println(errorMessage);
		}
	}

	public boolean isConnected() {
		return connectionInstance._isConnected();
	}

	class SSHConnection {

		private final Logger LOGGER = LoggerFactory.getLogger(getClass());

		private JSch jschSSHChannel;
		private String strUserName;
		private String strConnectionIP;
		private int intConnectionPort;
		private String strPassword;
		private Session sesConnection;
		private int intTimeOut;

		private void _doConstructorActions(String userName, String password, String connectionIP) {

			jschSSHChannel = new JSch();
			
			JSch.setLogger(new  com.jcraft.jsch.Logger(){
				public boolean isEnabled(int level){
					return true;
				}
				public void log(int level, String message){ 
					System.err.println(message);
				}
			});

			try {
				jschSSHChannel.setKnownHosts("~/.ssh/known_hosts");
			} catch (Exception e) {
			 
				e.printStackTrace();
			}
			
			// try { jschSSHChannel.setKnownHosts(knownHostsFileName); }
			// catch (JSchException jschX) { _logError(jschX.getMessage()); }

			strUserName = userName;
			strPassword = password;
			strConnectionIP = connectionIP;
			
			
		}

		private boolean _isConnected() {
			return sesConnection.isConnected();
		}

		SSHConnection(String userName, String password, String connectionIP) {
			_doConstructorActions(userName, password, connectionIP);
			intConnectionPort = 22;
			intTimeOut = 60000;
		}

		SSHConnection(String userName, String password, String connectionIP, int connectionPort) {
			_doConstructorActions(userName, password, connectionIP);
			intConnectionPort = connectionPort;
			intTimeOut = 60000;
		}

		SSHConnection(String userName, String password, String connectionIP, int connectionPort, int timeOutMilliseconds) {
			_doConstructorActions(userName, password, connectionIP);
			intConnectionPort = connectionPort;
			intTimeOut = timeOutMilliseconds;
		}

		// SSH send-command
		String _sendCommand(String command) {

			StringBuilder outputBuffer = new StringBuilder();
			Channel channel = null;
			try {
				channel = sesConnection.openChannel("exec");
				((ChannelExec) channel).setCommand(command);
				channel.connect();
				InputStream commandOutput = channel.getInputStream();
				int readByte = commandOutput.read();

				while (readByte != 0xffffffff) {
					outputBuffer.append((char) readByte);
					readByte = commandOutput.read();
				}
			}
			catch (IOException ioX) {
				_logWarning(ioX.getMessage());
				return null;
			}
			catch (JSchException jschX) {
				_logWarning(jschX.getMessage());
				return null;
			}
			finally {
				if(channel!=null)
					channel.disconnect();
			}
			return outputBuffer.toString();
		}

		// FTP send-file
		void _sendFile(String filename, String directory) {

			Channel channel = null;
			ChannelSftp sftpChannel = null;
			try {
				channel = sesConnection.openChannel("sftp");
				// sesConnection.set
				channel.connect();
				sftpChannel = (ChannelSftp) channel;

				sftpChannel.cd(directory);

				String tempDir = AppConfigLoader.getAppConfigDir();

				InputStream is = new FileInputStream(new File(tempDir + "/" + filename));

				BufferedInputStream bis = new BufferedInputStream(is, 1000);

				sftpChannel.put(bis, filename);
			}
			catch (JSchException jschX) {
				_logWarning(jschX.getMessage());
			}
			catch (SftpException sftpX) {
				_logWarning(sftpX.getMessage());
			}
			catch (FileNotFoundException e) {
				e.printStackTrace();
				_logWarning(e.getMessage());
			}
			finally {
				sftpChannel.exit();
				channel.disconnect();
			}
		}

		// FTP get-file
		String _getFile(String filename, String directory) {

			Channel channel = null;
			ChannelSftp sftpChannel = null;
			BufferedReader br = null;
			StringBuilder sb =  new StringBuilder();
			try {
				channel = sesConnection.openChannel("sftp");
				channel.connect();
				sftpChannel = (ChannelSftp) channel;

				sftpChannel.cd(directory);
				
				String line = "";
				br = new BufferedReader(new InputStreamReader(sftpChannel.get(filename)));
				while ((line = br.readLine()) != null) {
					sb.append(line + "\n");
				}
				br.close();
			}
			catch (JSchException jschX) {
				_logWarning(jschX.getMessage());
			}
			catch (SftpException sftpX) {
				_logWarning(sftpX.getMessage());
			}
			catch (IOException ioX) {
				_logWarning(ioX.getMessage());
			}
			finally {
				sftpChannel.exit();
				channel.disconnect();
			}
			return sb.toString();
		}

		private String _connect() {
			String errorMessage = null;

			java.util.Properties config = new java.util.Properties();
			config.put("StrictHostKeyChecking", "no");
			config.put("PreferredAuthentications", "password");
			try {
				sesConnection = jschSSHChannel.getSession(strUserName, strConnectionIP, intConnectionPort);
				sesConnection.setPassword(strPassword);
				sesConnection.setConfig(config);
				sesConnection.connect(intTimeOut);
			}
			catch (JSchException jschX) {
				errorMessage = jschX.getMessage();
			}

			return errorMessage;
		}

		private String _logError(String errorMessage) {
			if (errorMessage != null) {
				LOGGER.error("{} - {}", strConnectionIP + ":" + intConnectionPort, errorMessage);
			}

			return errorMessage;
		}

		private String _logWarning(String warnMessage) {
			if (warnMessage != null) {
				LOGGER.warn("{} - {}", strConnectionIP + ":" + intConnectionPort, warnMessage);
			}

			return warnMessage;
		}

		void disconnect() {
			sesConnection.disconnect();
		}
	}

}