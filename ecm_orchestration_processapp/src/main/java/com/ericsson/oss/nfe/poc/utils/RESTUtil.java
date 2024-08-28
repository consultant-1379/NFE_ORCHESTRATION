package com.ericsson.oss.nfe.poc.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpEntityEnclosingRequestBase;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ericsson.oss.nfe.poc.core.RESTInvokeException;
import com.ericsson.oss.nfe.poc.listeners.AppConfigLoader;
import com.ericsson.oss.nfe.poc.utils.vo.HeaderTupple;
import com.floreysoft.jmte.message.ParseException;

 

/**
 * 
 * This is the adapter class for calling the REST service. 
 * For every REST call a public method would exist.
 * And other utility methods common across operations are private.
 * 
 * @author evigkum
 *
 */

public class RESTUtil {

	private final static Logger LOGGER = LoggerFactory.getLogger(RESTUtil.class); 

	private final static Logger REQUESTLOGGER = LoggerFactory.getLogger("rio");

	/**
	 * This the method which calls the REST POST operation.
	 * 
	 *  @param jsonReqStr containing the complete JSON to be sent in request body.
	 *  
	 *  @param endpointURL the endpoint URL for the REST call
	 * 
	 * @return a string containing json response for successful 
	 *         or runtime exception for the creation request.
	 */


	public String doPOSTRequest(String jsonReqStr,String endpointURL,List<HeaderTupple> headers)throws RESTInvokeException
	{

		LOGGER.debug("entering doPOSTRequest");		 

		LOGGER.info("starting the rest call ");
 
		LOGGER.info("Endpoint URL build --> : "+endpointURL);

		HttpURLConnection urlConnection = null;
		String returnResponse = ""; 
 		try {

			URL url = new URL(endpointURL);
			
			urlConnection = (HttpURLConnection) url.openConnection();
			urlConnection.setRequestMethod("POST");
			urlConnection.setRequestProperty("Accept", "application/json");
			urlConnection.setRequestProperty("Content-Type", "application/json");		
			
			REQUESTLOGGER.info("REQUEST :"+jsonReqStr);   
			
			 
			//Set the generic header string
			//setHeaderRequestProperty("rest.server.header1",urlConnection);			 
			urlConnection.setDoOutput(true);
			
			//Set the authentication header
			urlConnection.setRequestProperty("Authorization", RESTUtil.buildAuthHeader()); 
			
			//set the headers Passed
			if(headers!=null && !headers.isEmpty())
			{
				for(HeaderTupple ht : headers)
					RESTUtil.setHeaderRequestProperty(ht, urlConnection);
			}
 
			OutputStream os = urlConnection.getOutputStream();
			os.write(jsonReqStr.toString().getBytes());
			os.flush();

			if (urlConnection.getResponseCode() != HttpURLConnection.HTTP_OK) {
				
				LOGGER.info("Failed REST call for  HTTP error code :"+urlConnection.getResponseCode());
				throw new RuntimeException("Failed : HTTP error code : "+ urlConnection.getResponseCode());
			}

			returnResponse = readResponse(urlConnection.getInputStream());

			LOGGER.info("rest call succeed with response code 200");

			REQUESTLOGGER.info("RESPONSE :"+returnResponse);   
			 
			
			LOGGER.info("SUCCESS returned for Create : ");

		} catch (MalformedURLException  e) { 
			LOGGER.error("Failed REST call for MalformedURLException : "+e.getMessage());
			throw new RuntimeException("Failed REST call for MalformedURLException",e);

		} catch (IOException e) { 
			LOGGER.error("Failed REST call for IOException : "+e.getMessage());
			throw new RuntimeException("Failed REST call for IOException",e);
		}

		finally
		{
		 
			urlConnection.disconnect();
		} 

		LOGGER.info(" exiting doPOSTRequest");

		return returnResponse;
	}


	/**
	 * This the method which calls the REST GET operation.
	 * 
	 *  @param endpointURL the endpoint URL for the REST call
	 * 
	 * @return a string containing json response for successful 
	 *         or runtime exception for the creation request.
	 */
	public String doGETRequest(String endpointURL,List<HeaderTupple> headers)throws RESTInvokeException
	{

		LOGGER.debug("entering doGETRequest"); 
 

		LOGGER.info("REST endpoint url built to : "+endpointURL);
		LOGGER.info("REST endpoint header built to : "+headers);

		HttpURLConnection urlConnection = null;
		String outJSONStr = null;
  		try {

			URL url = new URL(endpointURL);
			
			urlConnection = (HttpURLConnection) url.openConnection();
			urlConnection.setRequestMethod("GET");
			urlConnection.setRequestProperty("Accept", "application/json");

			//Set the authentication header
			urlConnection.setRequestProperty("Authorization", RESTUtil.buildAuthHeader());
			
			REQUESTLOGGER.info("REQUEST :");
			
			//set the headers Passed
			if(headers!=null && !headers.isEmpty())
			{
				for(HeaderTupple ht : headers)
					RESTUtil.setHeaderRequestProperty(ht, urlConnection);
			}

			if (urlConnection.getResponseCode() != HttpURLConnection.HTTP_OK) {
				throw new RuntimeException("Failed : HTTP error code : "+ urlConnection.getResponseCode());
			}

			outJSONStr = readResponse(urlConnection.getInputStream());

			LOGGER.info("rest call succeed with response code 200");

			REQUESTLOGGER.info("RESPONSE :"+outJSONStr); 
			
			 

		} catch (MalformedURLException  e) { 
			LOGGER.error("Failed REST call for MalformedURLException : "+e.getMessage());
			throw new RESTInvokeException(500,"Failed REST call for MalformedURLException");

		} catch (IOException e) { 
			LOGGER.error("Failed REST call for IOException : "+e.getMessage());
			throw new RESTInvokeException(500,"Failed REST call for IOException");
		}

		finally
		{
			urlConnection.disconnect();
		}


		LOGGER.info(" exiting doGETRequest");

		return outJSONStr;
	}
	
	
	private String doDeleteRequest_apacheVersion(String endpointURL,List<HeaderTupple> headers)
	{
		 String line = "";
		 try {
	            HttpClient c = new DefaultHttpClient();        
	            HttpDeleteWithEntity p = new HttpDeleteWithEntity(endpointURL);        
	 
	            p.setHeader("Authorization", RESTUtil.buildAuthHeader());
	          
	            p.setEntity(new StringEntity("{}", 
	                             ContentType.create("application/json")));
	 
	            HttpResponse r = c.execute(p);
	 
	            BufferedReader rd = new BufferedReader(new InputStreamReader(r.getEntity().getContent()));
	             line = "";
	            LOGGER.info("Got response to delete " + r.getStatusLine() +" " + r); 
	            while ((line = rd.readLine()) != null) {
	               //Parse our JSON response               
	          //     JSONParser j = new JSONParser();
	           //    JSONObject o = (JSONObject)j.parse(line);
	             //  Map response = (Map)o.get("response");
	 
	           //    System.out.println(response.get("somevalue"));
	            }
	            LOGGER.info("Got response to delete string " + line); 
	           /* if (line == null || line.equalsIgnoreCase("") || line.equalsIgnoreCase("{}"))
	            {
	            	line = "{\"dummy\":\"dummyvalue\"}";
	            }*/
	        }
	        catch(ParseException e) {
	           LOGGER.error("Delete Parse exception", e);
	        }
	        catch(IOException e) {
	        	LOGGER.error("Delete IO exception", e);;
	        }     
		 return line;
	}
	
	
	/**
	 * This the method which calls the REST GET operation.
	 * 
	 *  @param endpointURL the endpoint URL for the REST call
	 * 
	 * @return a string containing json response for successful 
	 *         or runtime exception for the creation request.
	 */
	public String doDeleteRequest(String endpointURL,List<HeaderTupple> headers)throws RESTInvokeException
	{

		LOGGER.debug("entering doDeleteRequest"); 
 

		LOGGER.info("REST endpoint url built to : "+endpointURL);
		LOGGER.info("REST endpoint header built to : "+headers);
		return doDeleteRequest_apacheVersion(endpointURL,headers);
//		HttpURLConnection urlConnection = null;
//		String outJSONStr = null;
//  		try {
//
//			URL url = new URL(endpointURL);
//			
//			urlConnection = (HttpURLConnection) url.openConnection();
//			 urlConnection.setRequestMethod("DELETE");
//			//urlConnection.setRequestMethod("POST");
//			// We have to override the post method so we can send data
//			//urlConnection.setRequestProperty("X-HTTP-Method-Override", "DELETE");
//			urlConnection.setRequestProperty("Accept", "application/json");
//			urlConnection.setRequestProperty("Content-Type", "application/json");	
//			
//			
//			//Set the authentication header
//			urlConnection.setRequestProperty("Authorization", RESTUtil.buildAuthHeader());
//			
//			REQUESTLOGGER.info("Delete REQUEST :");
//			
//			//set the headers Passed
//			if(headers!=null && !headers.isEmpty())
//			{
//				for(HeaderTupple ht : headers)
//					RESTUtil.setHeaderRequestProperty(ht, urlConnection);
//			}
//			//urlConnection.setDoOutput(true);
//			//OutputStream os = urlConnection.getOutputStream();
//			//os.write("{}".getBytes());
//			//os.flush();
//			
//			if (urlConnection.getResponseCode() != HttpURLConnection.HTTP_OK) {
//				throw new RuntimeException("Failed : HTTP error code : "+ urlConnection.getResponseCode());
//			}
//
//			outJSONStr = readResponse(urlConnection.getInputStream());
//
//			LOGGER.info("rest call succeed with response code 200");
//
//			REQUESTLOGGER.info("Delete RESPONSE :"+outJSONStr); 
//			
//			 
//
//		} catch (MalformedURLException  e) { 
//			LOGGER.error("Failed REST call for MalformedURLException : "+e.getMessage());
//			throw new RESTInvokeException(500,"Failed REST call for MalformedURLException");
//
//		} catch (IOException e) { 
//			LOGGER.error("Failed REST call for IOException : "+e.getMessage());
//			throw new RESTInvokeException(500,"Failed REST call for IOException");
//		}
//
//		finally
//		{
//			urlConnection.disconnect();
//		}
//
//
//		LOGGER.info(" exiting doDeleteRequest");
//
//		return outJSONStr;
	}

 
	/**
	 * Inputstream to String converter.
	 * @param is Inputsream of data.
	 * @return a string extracted from Inputstream.
	 */

	private static String readResponse(InputStream is) {
		java.util.Scanner s = new java.util.Scanner(is).useDelimiter("\\A");
		return s.hasNext() ? s.next() : "";

	}
	/**
	 * This method is used to build the authentication header.
	 * 
	 * @return authString "Basic "+Base64Encoded(user:password)
	 */
	public static String buildAuthHeader() {

		String name = AppConfigLoader.getProperty("rest.server.auth.username");
		String password = AppConfigLoader
				.getProperty("rest.server.auth.password");

		LOGGER.info("Authentication user Name  " + name
				+ " Password (only for debug to be removed) --> " + password);

		String authString = name + ":" + password;

		String authStringEnc = Base64Coder.encodeString(authString);

		LOGGER.info("Authentication authStringEnc --> "
				+ ("Basic " + authStringEnc));

		return "Basic " + authStringEnc;
	}

	public static void setHeaderRequestProperty(HeaderTupple headerProperty,
			HttpURLConnection urlConnection) {
		if (headerProperty != null) {
			urlConnection.setRequestProperty(headerProperty.getHeaderName(),
					headerProperty.getHeaderValue());

		}
	}
  
}
