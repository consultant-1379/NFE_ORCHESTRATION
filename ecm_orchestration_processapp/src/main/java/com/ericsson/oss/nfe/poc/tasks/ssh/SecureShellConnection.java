package com.ericsson.oss.nfe.poc.tasks.ssh;


public interface SecureShellConnection {
	
	String USERNAME = "root";
	String PASSWORD = "shroot";
	String CONNECTION_HOST = "atvts835.athtem.eei.ericsson.se";
	//String KNOWN_HOSTS = "C:\\Users\\esumdaw\\.ssh\\known_hosts";
	int CONNECTION_PORT = 2205;
	
	void connect();

	void disconnect();
	
	boolean isConnected();
	
	String sendCommand(String command);

	void sendFile(String filename, String destinationDirectory);
	
	String getFile(String remoteFilename, String remoteFilepath);
	
}
