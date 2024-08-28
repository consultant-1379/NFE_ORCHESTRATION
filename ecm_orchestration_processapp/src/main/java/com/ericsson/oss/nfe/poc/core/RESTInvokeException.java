package com.ericsson.oss.nfe.poc.core;

public class RESTInvokeException extends Exception {

	private int httpStatusCode;

	public RESTInvokeException() {
		super();
	}

	public RESTInvokeException(int code) {
		super();
		this.httpStatusCode = code;

	}

	public RESTInvokeException(int code, String messString) {
		super(messString);
		this.httpStatusCode = code;

	}

	public RESTInvokeException(int code, String messString, Throwable thr) {
		super(messString, thr);
		this.httpStatusCode = code;

	}

}
