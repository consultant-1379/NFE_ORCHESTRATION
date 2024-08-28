package com.ericsson.oss.nfe.poc.utils.vo;

import java.io.Serializable;

public class HeaderTupple implements Serializable {
	
	

	private String headerName;
	
	private String headerValue; 
	
	public HeaderTupple(String headerName, String headerValue) {
		super();
		this.headerName = headerName;
		this.headerValue = headerValue;
	}

	public String getHeaderName() {
		return headerName;
	}

	public void setHeaderName(String headerName) {
		this.headerName = headerName;
	}

	public String getHeaderValue() {
		return headerValue;
	}

	public void setHeaderValue(String headerValue) {
		this.headerValue = headerValue;
	}
	
	@Override
	public String toString() {
		return "HeaderTupple [headerName=" + headerName + ", headerValue="
				+ headerValue + "]";
	}

}
