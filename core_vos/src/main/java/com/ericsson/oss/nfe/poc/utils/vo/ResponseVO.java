package com.ericsson.oss.nfe.poc.utils.vo;

import java.io.Serializable;

import com.google.gson.JsonObject;

/**
 * The generic value object which has the standard strucutre for all
 * the REST reponseses . <e>data</e> contains the actual data in the 
 *  RAW JSON format.
 * 
 * @author evigkum
 *
 */
public class ResponseVO implements Serializable {

	private ResponseStatus status;

	private JsonObject data;
	
	private String jsonStr;


	public ResponseStatus getStatus() {
		return status;
	}

	public void setStatus(ResponseStatus status) {
		this.status = status;
	}

	public JsonObject getData() {
		return data;
	}

	public void setData(JsonObject data) {
		this.data = data;
		if(data!=null)
			this.jsonStr = this.data.toString();
	}
 
	
	public String getJsonStr() {
		return jsonStr;
	}

	public void setJsonStr(String jsonStr) {
		this.jsonStr = jsonStr;
	}

	@Override
	public String toString() {
		return "ResponseVO [status=" + status + ", data="  + data + " jsonStr " + jsonStr + "]";
	}



	public static class ResponseStatus implements Serializable {

		private String reqStatus = "SUCCESS";

		private String credentails;

		public ResponseStatus(){}
		
		public ResponseStatus(String reqStatus){
			this.reqStatus = reqStatus;
		}
			
		public String getReqStatus() {
			return reqStatus;
		}

		public void setReqStatus(String reqStatus) {
			this.reqStatus = reqStatus;
		}

		public String getCredentails() {
			return credentails;
		}

		public void setCredentails(String credentails) {
			this.credentails = credentails;
		}

		@Override
		public String toString() {
			return "ResponseStatus [reqStatus=" + reqStatus + ", credentails="
					+ credentails + "]";
		}
		
		

	}
}
