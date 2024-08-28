package com.ericsson.oss.nfe.poc.tasks;

import static com.ericsson.oss.nfe.poc.core.ApplicationConstants.ACTIVE_PROVISIONING;
import static com.ericsson.oss.nfe.poc.core.ApplicationConstants.DEFAULT_VDCNAME_KEY;
import static com.ericsson.oss.nfe.poc.core.ApplicationConstants.ECM_NAMEID_MAP;
import static com.ericsson.oss.nfe.poc.core.ApplicationConstants.GET_VDC_URL_KEY;
import static com.ericsson.oss.nfe.poc.core.ApplicationConstants.GET_VMS_FOR_VDC_URL_KEY;
import static com.ericsson.oss.nfe.poc.core.ApplicationConstants.GET_VNS_FOR_VDC_URL_KEY;
import static com.ericsson.oss.nfe.poc.core.ApplicationConstants.ID_JSON_KEY;
import static com.ericsson.oss.nfe.poc.core.ApplicationConstants.NAME_JSON_KEY;
import static com.ericsson.oss.nfe.poc.core.ApplicationConstants.PROVISION_STATUS_KEY;

import java.net.URLEncoder;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import net.minidev.json.JSONObject;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ericsson.oss.nfe.poc.core.RESTInvokeException;
import com.ericsson.oss.nfe.poc.listeners.AppConfigLoader;
import com.ericsson.oss.nfe.poc.utils.ECMRESTUtil;
import com.ericsson.oss.nfe.poc.utils.vo.ResponseVO;
import com.jayway.jsonpath.JsonPath;

public class QuerryAndPopulateOrderItems implements JavaDelegate {

	private final Logger log = LoggerFactory.getLogger(getClass());

	private Expression inputcreateOrderResponse;

	private Expression outPutVariable;

	public void execute(DelegateExecution execution) {

		log.info("------------------------------QuerryAndPopulateOrderItems task started ----------------- ");

		ECMRESTUtil restutil = new ECMRESTUtil();

		Map<String, String> ecmProcessIDMap = (Map<String, String>) execution
				.getVariable(ECM_NAMEID_MAP);

		// If the process Param is not already set and its first time
		ecmProcessIDMap = (ecmProcessIDMap == null || ecmProcessIDMap.isEmpty()) ? new HashMap<String, String>()
				: ecmProcessIDMap;

		String orderStatus = null;
		try {

			JSONObject vdcObject = this.extractVDC(restutil,execution);

			ecmProcessIDMap.put(getStringVal(vdcObject, NAME_JSON_KEY),
					getStringVal(vdcObject, ID_JSON_KEY));
			
			ecmProcessIDMap.put("vdc",
					getStringVal(vdcObject, ID_JSON_KEY));

			log.debug("VDC obtained is --->" + vdcObject.toJSONString());

			this.getAndPopulateVNS(restutil, ecmProcessIDMap, vdcObject);
			this.getAndPopulateVMS(restutil, ecmProcessIDMap, vdcObject);

			System.out.println(" ecmProcessIDMap populated is --> "
					+ ecmProcessIDMap);
			
			execution.setVariableLocal(ECM_NAMEID_MAP, ecmProcessIDMap);

			// Later will add VMS when needed

		} catch (Exception e) {
			log.error("Exeception Querrying VDC and VMS",e);
			throw new RuntimeException(e);
		}

		if (outPutVariable != null) {

			String outputVarName = outPutVariable.getExpressionText();
			execution.setVariable(outputVarName, orderStatus);

		}

		log.info("------------------------------VerifyOrderStatus task Ended ----------------- ");

	}

	private JSONObject extractVDC(ECMRESTUtil restutil,DelegateExecution execution) {

		JSONObject vdcObject = null;
		try {
			// First querry the VDC
			
			String vdcNameProcVariable = this.getVDCNameforFlow(execution);

			String getVDCURL = AppConfigLoader.getProperty(GET_VDC_URL_KEY);

			String tenantName = AppConfigLoader
					.getProperty("ecm.props.map.tenantName");
			String filter = "tenantName='" + tenantName + "'";

			ResponseVO getVDCResp = restutil.doGETRequest(getVDCURL
					+ URLEncoder.encode(filter));

			List<JSONObject> vdcs = JsonPath.read(getVDCResp.getJsonStr(),
					"$.vdcs");

			// VDC is a must cannot proceed without a provisioned VDC
			if (vdcs == null || vdcs.isEmpty())
				throw new RuntimeException("NO VDC's defined for the tenant : "
						+ tenantName +" in response " + getVDCResp.getJsonStr());

			for (JSONObject vdc : vdcs) {
				String status = (String) vdc.get(PROVISION_STATUS_KEY);
				String vdcName = (String) vdc.get("name");
				if (ACTIVE_PROVISIONING.equalsIgnoreCase(status) &&
						vdcNameProcVariable.equalsIgnoreCase(vdcName)) {
					vdcObject = vdc;
					break;
				}
			}
			// VDC is a must cannot proceed without a provisioned VDC
			if (vdcObject == null)
				throw new RuntimeException("NO VDC's defined for the tenant : "+ tenantName);

			log.debug("VDC obtained is --->" + vdcObject.toJSONString());

		} catch (Exception e) {
			log.error("Exeception building and extracting VDCS");
			throw new RuntimeException(e);
		}

		return vdcObject;
	}

	private void getAndPopulateVNS(ECMRESTUtil restutil,
			Map<String, String> ecmProcessIDMap, JSONObject vdcObject)
			throws RESTInvokeException {

		// then VNS for VDC for now+ "'" + vdcObject.get(ID_JSON_KEY)+"'"
		try {
			String getVNSURL = AppConfigLoader
					.getProperty(GET_VNS_FOR_VDC_URL_KEY);

			// Build the filter key and then encode
			String filter = "tenantName='"
					+ AppConfigLoader.getProperty("ecm.props.map.tenantName")
					+ "' 'and' 'vdcId'='"
					+ getStringVal(vdcObject, ID_JSON_KEY) + "'";

			ResponseVO getVNSResponse = restutil.doGETRequest(getVNSURL
					+ URLEncoder.encode(filter));

			List<JSONObject> vns = JsonPath.read(getVNSResponse.getJsonStr(),
					"$.vns");

			// Not throwing exception when VN or VMS are not present for VDC as
			// it might be possible
			if (vns != null && !vns.isEmpty()) {
				for (JSONObject vn : vns) {
					String status = (String) vn.get(PROVISION_STATUS_KEY);
					if (ACTIVE_PROVISIONING.equalsIgnoreCase(status)) {
						ecmProcessIDMap.put(getStringVal(vn, NAME_JSON_KEY),
								getStringVal(vn, ID_JSON_KEY));
					}
				}
			}
		} catch (Exception e) {
			log.warn(
					"Exeception building and extracting VNS for VDCS,ignoring as its ok",
					e);
			e.printStackTrace();
 		}
	}

	private void getAndPopulateVMS(ECMRESTUtil restutil,
			Map<String, String> ecmProcessIDMap, JSONObject vdcObject)
			throws RESTInvokeException {

		// then VNS for VDC for now+ "'" + vdcObject.get(ID_JSON_KEY)+"'"
		try {
			String getVMSURL = AppConfigLoader
					.getProperty(GET_VMS_FOR_VDC_URL_KEY);

			// Build the filter key and then encode
			String filter = "vdcId='" + getStringVal(vdcObject, ID_JSON_KEY)
					+ "' 'and' tenantName='"
					+ AppConfigLoader.getProperty("ecm.props.map.tenantName").trim()
					+ "'";

			ResponseVO getVMSResponse = restutil.doGETRequest(getVMSURL
					+ URLEncoder.encode(filter));

			List<JSONObject> vms = JsonPath.read(getVMSResponse.getJsonStr(),
					"$.vms");

			// Not throwing exception when VN or VMS are not present for VDC as
			// it might be possible
			if (vms != null && !vms.isEmpty()) {
				for (JSONObject vn : vms) {
					String status = (String) vn.get(PROVISION_STATUS_KEY);
					if (ACTIVE_PROVISIONING.equalsIgnoreCase(status)) {
						ecmProcessIDMap.put(getStringVal(vn, NAME_JSON_KEY),
								getStringVal(vn, ID_JSON_KEY));
					}
				}
			}
		} catch (Exception e) {
			log.warn(
					"Exeception building and extracting VMS for VDCS,ignoring as its ok",
					e);
			e.printStackTrace();
 		}
	}
	
	
	private String getVDCNameforFlow(DelegateExecution execution)
	{		
		String vdcName = execution.getVariable("VDCName")!=null?
				execution.getVariable("VDCName").toString():AppConfigLoader
				.getProperty(DEFAULT_VDCNAME_KEY);
		 
		return vdcName;
	}

	private String getStringVal(JSONObject json, String key) {
		Object val = json.get(key);
		return val != null ? val.toString() : "";
	}

}