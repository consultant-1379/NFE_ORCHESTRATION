package com.ericsson.pct;

import static com.ericsson.oss.nfe.poc.core.ApplicationConstants.GET_VNS_FOR_VDC_URL_KEY;

import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import net.minidev.json.JSONObject;

import org.apache.commons.lang.StringUtils;
import org.junit.Ignore;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ericsson.oss.nfe.poc.core.RESTInvokeException;
import com.ericsson.oss.nfe.poc.listeners.AppConfigLoader;
import com.ericsson.oss.nfe.poc.utils.ECMRESTUtil;
import com.ericsson.oss.nfe.poc.utils.JSONTemplateBuilder;
import com.ericsson.oss.nfe.poc.utils.Utils;
import com.ericsson.oss.nfe.poc.utils.vo.ResponseVO;
import com.floreysoft.jmte.Engine;
import com.jayway.jsonpath.JsonPath;

public class JSONTTest {

	private final static Logger LOGGER = LoggerFactory.getLogger(JSONTTest.class);

	
	@Test
	public void appConfigLoaderTest() {		
		
		new AppConfigLoader();
		
		System.out.println(AppConfigLoader.getECMPropsMap());
		
		
	}
	@Ignore @Test
	public void jsonTtest() {		
		
		
		ECMRESTUtil restUtil = new ECMRESTUtil();
 
		//FileUtils.loadFileAsString("./json/input-meta.json");
		ResponseVO json= null;
		try {
			json = restUtil.doGETRequest("http://159.107.167.92:8585/service/ecm_mock/getvdcoffer");
		} catch (RESTInvokeException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
 		List<JSONObject> offersItems =  JsonPath.read(json.getData().toString(), "$.data.offer.offerItems");
 		
 		List<JSONObject> orderItems = new ArrayList<JSONObject>();
 		
		for (JSONObject itr : offersItems) {
			
			String key = itr.keySet().iterator().next();
			// String methodName = "extract"+key.toUpperCase();
			// Method method = BeanUtils.findMethod(JSONTemplateBuilder.class,
			// methodName, JSONObject.class);

			JSONObject temp = JSONTemplateBuilder
					.extractJSONObj((JSONObject) itr.get(key),"");
			temp.put("key", key);
			orderItems.add(temp);
		}
 		 
 		Map<String,String> embededIDMap = new HashMap<String,String>();
 		//Post process the orders
 		for(int i=0;i<orderItems.size();i++)
 		{
 			JSONObject temp = orderItems.get(i);
 			embededIDMap.put(temp.get("key").toString(), String.valueOf(i)); 
 			temp.put("orderItemId", i);
 			JSONObject outputObj = (JSONObject)temp.clone();
 			
 			for(String objKey : temp.keySet())
				{
 				//TODO explain what the heck is being done
					if(objKey.startsWith("EMBEDED_"))
					{
						
						String embededKey = objKey.substring(8);
						String embededKeyVal = (String)temp.get(objKey);						
						
						JSONObject innerObj = new JSONObject();
						if(embededIDMap.containsKey(embededKey))
						{
							innerObj.put("orderItemRef", embededIDMap.get(embededKey));
						}
						else
						{
							if(StringUtils.isEmpty(embededKeyVal))
								innerObj.put("id", "<<"+embededKey+".id>>");
							else
								innerObj.put("id","<<"+embededKeyVal+".id>>");
						}
						
						outputObj.remove("key");
						outputObj.remove(objKey);
						outputObj.put(embededKey, innerObj);
								
					}
				}
 			
 			String methodName = JSONTemplateBuilder.buildOperation(temp.get("key").toString());
 			System.out.println(methodName + ":  "+outputObj);
 		} 		
 		 
	}

	@Ignore @Test
	public void jsonTtest2() {		
		
		 
		 new AppConfigLoader();
		ECMRESTUtil restUtil = new ECMRESTUtil();
 
		//FileUtils.loadFileAsString("./json/input-meta.json");
		
		String URI = "tenantName='eeiafr' 'and' 'vdcId'="+"'VDC-3616'";
		
		 String url =  AppConfigLoader.getProperty(GET_VNS_FOR_VDC_URL_KEY)+URLEncoder.encode(URI) ;
		ResponseVO rspvo= null;
		try {
			rspvo = restUtil.doGETRequest(url);
			
			System.out.println(JsonPath.read(rspvo.getJsonStr(), "$.vdcs"));
			
		} catch (RESTInvokeException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} 
	
		System.out.println(rspvo.getJsonStr());
 	 
	}
	 
	 @Ignore @Test
	 public void testTemplating()
	 {
		 LOGGER.info("shuxxxxxxxxxxxxxxxxxxxxx");
		Engine engine = new Engine();
		 new AppConfigLoader();
			ECMRESTUtil restUtil = new ECMRESTUtil();
	 
			//FileUtils.loadFileAsString("./json/input-meta.json");
			ResponseVO json= null;
			try {
				json = restUtil.doGETRequest("http://E768B599EF8C8D.ericsson.se:18000/ecm_service/offers/IPWORKSVMOFFER");
			} catch (RESTInvokeException e) {
 				e.printStackTrace();
			}
		
		
			System.out.println("Response :"+json);
			String template = "";
			try {
				template = JSONTemplateBuilder.buildTemplateResponse(json.getJsonStr());
			} catch (RESTInvokeException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}			
 		 	 
		 
 		 Map<String, Object> model = new HashMap<String, Object>();
		 model.put("vimZoneName", "myVzId");
		 model.put("tenantName", "eeiafr");
 		 String transformed = engine.transform(template, model);
		 System.out.println("Rest Request is --> "+transformed);
		 
		/*//Now send the post 
		 try {
				//json = restUtil.doPOSTRequest(transformed,"http://E768B599EF8C8D.ericsson.se:18000/ecm_service/orders");
				
				System.out.println("Response is ---> "+json.getJsonStr());
			} catch (RESTInvokeException e) {
				e.printStackTrace();
			}*/
		
 	 }
	 @Test
	 public void testextractVDCID()
	 {
		 System.out.println(Utils.extractVDCID("TestVDC(vdc-11)"));
		 org.junit.Assert.assertEquals(Utils.extractVDCID("TestVDC(vdc-11)"), "vdc-11");
	 }
	
}
