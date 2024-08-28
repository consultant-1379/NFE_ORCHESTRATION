package com.ericsson.oss.nfe.poc.utils;

import java.lang.reflect.Type;
import java.net.HttpURLConnection;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ericsson.oss.nfe.poc.core.RESTInvokeException;
import com.ericsson.oss.nfe.poc.utils.vo.ResponseVO;
import com.ericsson.oss.nfe.poc.utils.vo.ResponseVO.ResponseStatus;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParseException;

/**
 * 
 * This is the adapter class for calling the REST service. For every REST call a
 * public method would exist. And other utility methods common across operations
 * are private.
 * 
 * @author evigkum
 * 
 */

public class ECMRESTUtil {

	private final static Logger LOGGER = LoggerFactory.getLogger(ECMRESTUtil.class);

	private final static Logger REQUESTLOGGER = LoggerFactory.getLogger("rio");

	/**
	 * This the method which calls the REST POST operation.
	 * 
	 * @param jsonReqStr
	 *            containing the complete JSON to be sent in request body.
	 * 
	 * @param endpointURL
	 *            the endpoint URL for the REST call
	 * 
	 * @return a string containing json response for successful or runtime
	 *         exception for the creation request.
	 */

	public ResponseVO doPOSTRequest(String jsonReqStr, String endpointURL)
			throws RESTInvokeException {

		LOGGER.info(" entering doPOSTRequest " + endpointURL +" " + jsonReqStr);

		HttpURLConnection urlConnection = null;
		String returnResponse = "";
		ResponseVO respVo = null;

		returnResponse = new RESTUtil().doPOSTRequest(jsonReqStr, endpointURL,
				null);

		LOGGER.info("rest call succeed with response code 200");

		REQUESTLOGGER.info("RESPONSE :" + returnResponse);

		// This is done to avoid the serializtion exception in camunda cause
		// of jsonobject non serializable erro
		respVo = this.unMarshallResponse(returnResponse);
		

		// TODO get the messages from
		if (!(respVo != null && "SUCCESS".equalsIgnoreCase(respVo.getStatus()
				.getReqStatus())))
			throw new RESTInvokeException(500,
					"Failed REST call for Error returned");
		
		respVo.setJsonStr(respVo.getData().toString());
		respVo.setData(null);

		LOGGER.info("SUCCESS returned for Create : ");

		LOGGER.info(" exiting doPOSTRequest");

		return respVo;
	}

	/**
	 * This the method which calls the REST GET operation.
	 * 
	 * @param endpointURL
	 *            the endpoint URL for the REST call
	 * 
	 * @return a string containing json response for successful or runtime
	 *         exception for the creation request.
	 */
	public ResponseVO doGETRequest(String endpointURL)
			throws RESTInvokeException {

		LOGGER.info(" entering doGETRequest");
 
		String outJSONStr = null;
		ResponseVO respVo = null;

		outJSONStr = new RESTUtil().doGETRequest(endpointURL, null);

		REQUESTLOGGER.info("RESPONSE :" + outJSONStr);

		respVo = this.unMarshallResponse(outJSONStr);
		if (respVo.getData() != null)
			respVo.setJsonStr(respVo.getData().toString());
		respVo.setData(null);

		// TODO get the messages from
		if (!(respVo != null && "SUCCESS".equalsIgnoreCase(respVo.getStatus()
				.getReqStatus())))
			throw new RESTInvokeException(500,
					"Failed REST call for Error returned");

		LOGGER.info(" exiting doGETRequest");

		return respVo;
	}
	
	/**
	 * This the method which calls the REST GET operation.
	 * 
	 * @param endpointURL
	 *            the endpoint URL for the REST call
	 * 
	 * @return a string containing json response for successful or runtime
	 *         exception for the creation request.
	 */
	public ResponseVO doDeleteRequest(String endpointURL)
			throws RESTInvokeException {

		LOGGER.info(" entering doDeleteRequest");
 
		String outJSONStr = null;
		ResponseVO respVo = null;

		outJSONStr = new RESTUtil().doDeleteRequest(endpointURL, null);
		LOGGER.info(" Checking Delete outJSONStr " + outJSONStr );
		REQUESTLOGGER.info("RESPONSE :" + outJSONStr);
		
		
		respVo = this.unMarshallResponse(outJSONStr);
		if (respVo.getData() != null)
			respVo.setJsonStr(respVo.getData().toString());
		respVo.setData(null);

		LOGGER.info(" Checking Delete Status " + respVo );
		// TODO get the messages from
		if (!(respVo != null && "SUCCESS".equalsIgnoreCase(respVo.getStatus()
				.getReqStatus())))
			throw new RESTInvokeException(500,
					"Failed REST call for Error returned");

		LOGGER.info(" exiting doDeleteRequest");

		return respVo;
	}

	public ResponseVO unMarshallResponse(String jsonStr) {
		ResponseVO responseJson = null;

		try {
			GsonBuilder builder = new GsonBuilder().registerTypeAdapter(
					JsonObject.class, new JsonObjectTypeAdapter());

			Gson gson = builder.create();
			
			 if (jsonStr == null || StringUtils.isEmpty(jsonStr) || jsonStr.equalsIgnoreCase("{}"))
			{
				 LOGGER.info(" building a dummy success response " + jsonStr + " ; ");

				 responseJson = new ResponseVO();
				 ResponseVO.ResponseStatus status = new ResponseStatus();
				 status.setReqStatus("SUCCESS");
				 responseJson.setStatus(status);
			}
			 else
				 responseJson = (ResponseVO) gson
					.fromJson(jsonStr, ResponseVO.class);

		} catch (Exception e) {
			responseJson.setStatus(new ResponseStatus("FAILED"));
		}

		return responseJson;
	}
 

	/**
	 * This method is used to build the authentication header.
	 * 
	 * @return authString "Basic "+Base64Encoded(user:password)
	 */
 

	private static class JsonObjectTypeAdapter implements
			JsonDeserializer<JsonElement> {
		public JsonObject deserialize(JsonElement json, Type JsonObject,
				JsonDeserializationContext context) throws JsonParseException {
			return (JsonObject) json;
		}
	}
}
