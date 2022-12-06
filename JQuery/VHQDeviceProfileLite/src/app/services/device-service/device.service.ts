import { Injectable, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../app.config';
import {
  Model,
  DeviceInterface,
  DeviceProfileInterface,
} from '../../device-profile/device-profile.component';
import { AppGlobals } from '../app.global';
import { AppEnum } from 'src/app/components/shared/appEnum';
import { isEmpty } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  token: string;
  sso_url: string;
  sso_credentials: string;
  dataService_url: string;
  data: any;
  clientdata: any;
  samlToken: string;
  bearerToken: string;
  model: Model;
  deviceData: DeviceInterface;
  deviceProfileData: DeviceProfileInterface;
  deviceProfileTemplateData: any;
  customerId: string;
  UniqueDeviceId: string;
  // groups: any;
  dataGrid: any;
  ModelName: string;
  helpGuide: string;
  isHostedPage: boolean;
  profileEditMode: boolean;
  groupsSource: any = new BehaviorSubject('');
  currentGroups: any = this.groupsSource.asObservable();
  tabletProfileData: any[];
  isMessageTabVisible: any = false;
  deviceProfileKeyInventoryData: any;
  deviceProfileCertificatesData: any;

  accessToken: string;
  customerName: string;
  externalUserName: string;
  userGuid: string;
  resizedColumns: any[];
  @Output() ClickedEvent = new EventEmitter<Eventdata>();
  // protected apiServer=AppConfig.settings.apiServer;
  constructor(private httpClient: HttpClient, private _global: AppGlobals) {
    this.clientdata = 'grant_type=client_credentials';
    this.data = 'grant_type=password&username=userqa1@outlook.com&password=HRuT@j3j1&scope=openid';
    this.sso_url = '"https://qa.account.verifonecp.com/oauth2/token"';
    this.sso_credentials = 'Yffui5FOZONqlBPJOkY46HjZ0QIa:jAQo8bw_jJHwXXbWSH7gFYZEAB4a';
    this.UniqueDeviceId = '9990';
    this.dataService_url = AppConfig.settings.apiServer.vhq_url;
    this.helpGuide = AppConfig.settings.apiServer.help_url;
  }

  getSSOHttpOptions() {
    const basictoken = btoa(this.sso_credentials);
    this.token = basictoken;
    return {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        Accept: '*/*,application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + basictoken,
      }),
    };
  }
  getHelpGuidURL() {
    return this.helpGuide;
  }
  setBearerToken(token: string) {
    this.bearerToken = 'Bearer ' + token;
  }
  getBearerToken() {
    return this.httpClient.post<any>(
      this.sso_url,
      this.data,
      this.getSSOHttpOptions()
    );
  }

  setSamlToken() {
    if (window.sessionStorage.getItem('loginResponse')) {
      this.samlToken = window.sessionStorage.getItem('loginResponse');
    }
    if (window.sessionStorage.getItem('CustomerName')) {
      this.customerName = window.sessionStorage.getItem('CustomerName');
    }
    if (window.sessionStorage.getItem('CustomerId')) {
      this.customerId = window.sessionStorage.getItem('CustomerId');
    }
    this.samlToken = "%3c%3fxml+version%3d%221.0%22+encoding%3d%22utf-16%22%3f%3e%3cAssertion+ID%3d%22IDd06c0d6a-f020-4601-a4a4-bfc91cc97d65%22+IssueInstant%3d%222022-10-19T09%3a45%3a52.089Z%22+Version%3d%222.0%22+xmlns%3d%22urn%3aoasis%3anames%3atc%3aSAML%3a2.0%3aassertion%22%3e%3cIssuer%3ehttps%3a%2f%2flocalhost%2fAuthToken%3c%2fIssuer%3e%3cSignature+xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2f09%2fxmldsig%23%22%3e%3cSignedInfo%3e%3cCanonicalizationMethod+Algorithm%3d%22http%3a%2f%2fwww.w3.org%2f2001%2f10%2fxml-exc-c14n%23%22+%2f%3e%3cSignatureMethod+Algorithm%3d%22http%3a%2f%2fwww.w3.org%2f2000%2f09%2fxmldsig%23rsa-sha1%22+%2f%3e%3cReference+URI%3d%22%23IDd06c0d6a-f020-4601-a4a4-bfc91cc97d65%22%3e%3cTransforms%3e%3cTransform+Algorithm%3d%22http%3a%2f%2fwww.w3.org%2f2000%2f09%2fxmldsig%23enveloped-signature%22+%2f%3e%3cTransform+Algorithm%3d%22http%3a%2f%2fwww.w3.org%2f2001%2f10%2fxml-exc-c14n%23%22+%2f%3e%3c%2fTransforms%3e%3cDigestMethod+Algorithm%3d%22http%3a%2f%2fwww.w3.org%2f2000%2f09%2fxmldsig%23sha1%22+%2f%3e%3cDigestValue%3ed8BJtl87xPqS3jmlqzXDvFfKjcQ%3d%3c%2fDigestValue%3e%3c%2fReference%3e%3c%2fSignedInfo%3e%3cSignatureValue%3eK0S5AttXXd4TQ18NH5Jyi4nMEkpy0ejUL3N8Lm8YgGBPJTNxGqByB0zlwUJrLQrwsZdC%2bF4skmLQC9yCE3NmVFK8ENGZ02%2bx5GaaxLL5UdoU4%2biDkytVGEDupJ%2boCVHHNAxWoCERJiglLJG1qOjjxhjgpLjZogr7CHHpwnAz%2bRATmLXdmEEhKIuAwvnChn9McTKOiYq%2b10X5f5rS18KJtGejFJbnyGphAtur0jvkXsP%2fCCieV39IYEfZgqHGg2wFN7YVNJ2sxm%2f2c99QyJ7DFGGMpQNVCztPcdoNwsyeLEuBwz9eEA6x0uxyI%2b9XZsj69atS%2f3O807vdkV9o9UZxlg%3d%3d%3c%2fSignatureValue%3e%3cKeyInfo%3e%3cKeyValue%3e%3cRSAKeyValue%3e%3cModulus%3eqCarI9RcnbMbdKNOHcGOAPAHQboqm3Iw07SUTtMua%2fAuDM8lyR3wI2DPvby3ardMR%2bSezULYBTxiRRkxiTpZssZZbPcsUA6vPjJUr3h7xXq38LigPBSkM5ONHRr9OqJ9AcNY5rg68z3HVLeh7X3ryB30xBQEKskY%2fhyF8UEqR7v%2fhckIx4Mtu3ynNNeNzITeEYYJfC8LtOWrR4LF1GZDcuDR7OU5U9QmnO%2bwLGbEH0h%2fIttoVKTGvDULdIJgYFjw4X3qpWGQVKkK%2fIXAlOJ4keF69q%2bs3L1j7YyWKCEJV%2f1aTfev%2b7QaUJcZ4tbPSWzTNANFlujwmlVPLDUOyB9MXQ%3d%3d%3c%2fModulus%3e%3cExponent%3eAQAB%3c%2fExponent%3e%3c%2fRSAKeyValue%3e%3c%2fKeyValue%3e%3c%2fKeyInfo%3e%3c%2fSignature%3e%3cSubject%3e%3cNameID%3eAuthToken%3c%2fNameID%3e%3cSubjectConfirmation+Method%3d%22urn%3aoasis%3anames%3atc%3aSAML%3a2.0%3acm%3abearer%22%3e%3cNameID%3ehttps%3a%2f%2flocalhost%2fAuthToken%3c%2fNameID%3e%3cSubjectConfirmationData+%2f%3e%3c%2fSubjectConfirmation%3e%3c%2fSubject%3e%3cConditions+NotBefore%3d%222022-10-19T09%3a45%3a52.094Z%22+NotOnOrAfter%3d%222022-10-20T09%3a45%3a52.094Z%22%3e%3cAudienceRestriction%3e%3cAudience%3ehttps%3a%2f%2flocalhost%2fAuthToken%3c%2fAudience%3e%3c%2fAudienceRestriction%3e%3c%2fConditions%3e%3cAttributeStatement%3e%3cAttribute+Name%3d%22http%3a%2f%2fcommon.verifone.com%2fclaims%2fcustomername%22%3e%3cAttributeValue%3eR11Playground%3c%2fAttributeValue%3e%3c%2fAttribute%3e%3c%2fAttributeStatement%3e%3cAttributeStatement%3e%3cAttribute+Name%3d%22http%3a%2f%2fcommon.verifone.com%2fclaims%2ftitle%22%3e%3cAttributeValue%3eDefault+User%3c%2fAttributeValue%3e%3c%2fAttribute%3e%3c%2fAttributeStatement%3e%3cAttributeStatement%3e%3cAttribute+Name%3d%22http%3a%2f%2fcommon.verifone.com%2fclaims%2ftitle%22%3e%3cAttributeValue%3eDefault+User%3c%2fAttributeValue%3e%3c%2fAttribute%3e%3c%2fAttributeStatement%3e%3cAttributeStatement%3e%3cAttribute+Name%3d%22http%3a%2f%2fcommon.verifone.com%2fclaims%2floginname%22%3e%3cAttributeValue%3evhqadmin%40verifone.com%3c%2fAttributeValue%3e%3c%2fAttribute%3e%3c%2fAttributeStatement%3e%3cAttributeStatement%3e%3cAttribute+Name%3d%22http%3a%2f%2fcommon.verifone.com%2fclaims%2femailaddress%22%3e%3cAttributeValue%3eRanjithk1%40verifone.com%3c%2fAttributeValue%3e%3c%2fAttribute%3e%3c%2fAttributeStatement%3e%3cAttributeStatement%3e%3cAttribute+Name%3d%22http%3a%2f%2fcommon.verifone.com%2fclaims%2fgivenname%22%3e%3cAttributeValue%3eVHQAdmin%3c%2fAttributeValue%3e%3c%2fAttribute%3e%3c%2fAttributeStatement%3e%3cAttributeStatement%3e%3cAttribute+Name%3d%22http%3a%2f%2fcommon.verifone.com%2fclaims%2flastname%22%3e%3cAttributeValue%3eAdmin%3c%2fAttributeValue%3e%3c%2fAttribute%3e%3c%2fAttributeStatement%3e%3cAttributeStatement%3e%3cAttribute+Name%3d%22http%3a%2f%2fcommon.verifone.com%2fclaims%2ftelephone%22%3e%3cAttributeValue+%2f%3e%3c%2fAttribute%3e%3c%2fAttributeStatement%3e%3cAttributeStatement%3e%3cAttribute+Name%3d%22http%3a%2f%2fcommon.verifone.com%2fclaims%2fcontactnumber2%22%3e%3cAttributeValue+%2f%3e%3c%2fAttribute%3e%3c%2fAttributeStatement%3e%3cAttributeStatement%3e%3cAttribute+Name%3d%22http%3a%2f%2fcommon.verifone.com%2fclaims%2ftokenid%22%3e%3cAttributeValue%3e5b02a063-dc88-4845-8830-0e0d0b695623%3c%2fAttributeValue%3e%3c%2fAttribute%3e%3c%2fAttributeStatement%3e%3c%2fAssertion%3e";
    this.customerName = "R11Playground";
    this.customerId = '1382';
  }
  getSamlToken() {
    return this.samlToken;
  }

  getDataServiceHttpOptions() {
    let httpsHeaders = {};
    if (this.isHostedPage) {
      httpsHeaders = {
        'Content-Type': 'application/json',
        CustomerId: '' + this.customerId,
        CustomerName: this.customerName ? this.customerName : '',
        Authorization: this.bearerToken ? this.bearerToken : '',
        SourceType: 'HostedPage',
        externalUserName: this.externalUserName ? this.externalUserName : '',
      };
    } else {
      httpsHeaders = {
        'Content-Type': 'application/json',
        CustomerId: '' + this.customerId,
        CustomerName: this.customerName ? this.customerName : '',
        Authorization: this.bearerToken ? this.bearerToken : '',
      };
    }

    return {
      headers: new HttpHeaders(httpsHeaders),
    };
  }

  getCustomerName() {
    return this.customerName;
  }

  getCustomerId() {
    return this.customerId;
  }

  getToken() {
    const token =
      this.bearerToken != undefined ? this.bearerToken : this.samlToken;
    return token;
  }
  setAccessToken(token: string) {
    this.accessToken = token;
  }
  getAccessToken() {
    return this.accessToken;
  }
  setUniqueDeviceId(id: any) {
    this.UniqueDeviceId = id;
  }
  getUniqueDeviceId() {
    return this.UniqueDeviceId;
  }
  setExternalUserName(username: string) {
    this.externalUserName = username;
  }
  getExternalUserName(): string {
    return this.externalUserName ? this.externalUserName : '';
  }
  setDeviceData(model: any, deviceData: any, deviceProfileData: any) {
    this.model = model;
    this.deviceData = deviceData;
    this.deviceProfileData = deviceProfileData;
  }
  setDeviceProfileTemplateData(deviceProfileTemplate: any) {
    this._global.DeviceProfileTemplate = deviceProfileTemplate;
    this.deviceProfileTemplateData = deviceProfileTemplate;
  }
  setTabletProfileData(deviceProfileTabletInformation: any[]) {
    this.tabletProfileData = deviceProfileTabletInformation;
  }
  getTableProfileData() {
    return this.tabletProfileData;
  }
  getDataServiceURL(controllerName: string = '') {
    try {
      let url = AppConfig.settings.apiServer.vhq_url;
      const customerData = JSON.parse(sessionStorage.getItem('customerDataForDeviceProfile'));
      if (customerData) {
        if (customerData[0].IsMongoEnabled) {
          url = AppConfig.settings.apiServer.mongo_api_url;
          if (controllerName.length > 0) {
            url = url + "/" + controllerName;
          }
        }
      }
      return url;
    }
    catch (Ex) {
      console.log(Ex);
      return AppConfig.settings.apiServer.mongo_api_url;
    }
  }
  // setDeviceGroups(groups: any) {
  //   this.groups=groups;
  // }
  // getDeviceGroups() {
  //  return this.groups;
  // }

  updateGroups(groups: any) {
    this.groupsSource.next(groups);
  }
  getModelData() {
    return this.model;
  }
  setDataGrid(jqxGrid: any) {
    this.dataGrid = jqxGrid;
  }

  getDataGrid() {
    return this.dataGrid;
  }
  getDeviceData() {
    return this.deviceData;
  }
  getDeviceProfileData() {
    return this.deviceProfileData;
  }
  getDeviceProfileTemplateData() {
    return this.deviceProfileTemplateData;
  }
  setMessageTabVisiblity(flag: boolean) {
    this.isMessageTabVisible = flag;
  }
  getMessageTabVisiblity() {
    return this.isMessageTabVisible;
  }
  getDeviceUniqueID(serialnumber: string, deviceid: string) {
    if (isEmpty(serialnumber) || serialnumber === '') {
      serialnumber = '{SerialNumber}';
    }
    if (isEmpty(deviceid) || deviceid === '') {
      deviceid = '{DeviceDID}';
    }
    const url =
      this.dataService_url +
      '/GetUniqueDeviceId/' +
      this.ModelName +
      '/' +
      serialnumber +
      '/' +
      deviceid;

    return this.httpClient.get<any>(url, this.getDataServiceHttpOptions());
  }
  getModels() {
    const modeldata = '{"token":"' + this.getToken() + '"}';

    return this.httpClient.post<any>(
      this.dataService_url + '/GetModels',
      modeldata,
      this.getDataServiceHttpOptions()
    );
  }

  getAllTimeZones() {
    const data = '{"token":"' + this.getToken() + '"}';

    return this.httpClient.post<any>(
      this.dataService_url + '/GetTimeZones',
      data,
      this.getDataServiceHttpOptions()
    );
  }

  getMultiChoiceFilterData() {
    const data = '{"token":"' + this.getToken() + '"}';

    return this.httpClient.post<any>(
      this.dataService_url + '/GetMultiChoiceFilterData',
      data,
      this.getDataServiceHttpOptions()
    );
  }

  getDevice(UniqueDeviceId: string) {
    const modeldata =
      '{"token": "' +
      this.getToken() +
      '" ,"deviceIn":{"UniqueDeviceId":' +
      UniqueDeviceId +
      '}}';

    return this.httpClient.post<any>(
      this.dataService_url + '/GetDevice',
      modeldata,
      this.getDataServiceHttpOptions()
    );
  }

  getDeviceProfileTemplate(getDeviceProfileTemplate: any) {
    const modeldata =
      '{"token":"' +
      this.getToken() +
      '","getDeviceProfileTemplateReq":' +
      JSON.stringify(getDeviceProfileTemplate) +
      '}';

    return this.httpClient.post<any>(
      this.dataService_url + '/GetDeviceProfileTemplate',
      modeldata,
      this.getDataServiceHttpOptions()
    );
  }

  getCustomIdentifiers(UniqueDeviceId: string) {
    const devicedata =
      '{"token":"' +
      this.getToken() +
      '","uniqueDeviceId":' +
      UniqueDeviceId +
      '}';

    return this.httpClient.post<any>(
      this.dataService_url + '/GetCustomIdentifiers',
      devicedata,
      this.getDataServiceHttpOptions()
    );
  }

  getDeviceDiagnosticsData(UniqueDeviceId: string) {
    const devicedata =
      '{"token":"' +
      this.getToken() +
      '","uniqueDeviceId":' +
      UniqueDeviceId +
      '}';

    return this.httpClient.post<any>(
      this.dataService_url + '/GetDeviceDiagnosticsData',
      devicedata,
      this.getDataServiceHttpOptions()
    );
  }
  getDeviceVRKCertificate(getDeviceVRKCertificateReq: object) {
    const devicedata =
      '{"token":"' +
      this.getToken() +
      '","getDeviceVRKCertificateReq":' +
      JSON.stringify(getDeviceVRKCertificateReq) +
      '}';

    return this.httpClient.post<any>(
      this.dataService_url + '/GetDeviceVRKCertificate',
      devicedata,
      this.getDataServiceHttpOptions()
    );
  }
  getApplicationsOnDevice(UniqueDeviceId: string) {
    const devicedata =
      '{"token":"' +
      this.getToken() +
      '","getApplicationsOnDeviceReq":{"uniqueDeviceId":"' +
      UniqueDeviceId +
      '"}}';
    return this.httpClient.post<any>(
      this.dataService_url + '/GetApplicationsOnDevice',
      devicedata,
      this.getDataServiceHttpOptions()
    );
  }
  getParameterApplicationsForDevice(getParameterApplicationsReq: object) {
    const devicedata =
      '{"token":"' +
      this.getToken() +
      '","getParameterApplicationsReq":' +
      JSON.stringify(getParameterApplicationsReq) +
      '}';
    return this.httpClient.post<any>(
      this.dataService_url + '/GetParameterApplicationsForDevice',
      devicedata,
      this.getDataServiceHttpOptions()
    );
  }
  getDeviceAlertHistory(getDeviceAlertHistoryReq: object) {
    return this.httpClient.post<any>(
      this.dataService_url + '/GetDeviceAlertHistory',
      JSON.stringify(getDeviceAlertHistoryReq),
      this.getDataServiceHttpOptions()
    );
  }

  getDeviceSwapHistory(deviceSwapHistoryReq: any) {
    return this.httpClient.post<any>(
      this.dataService_url + '/GetDeviceSwapHistory',
      JSON.stringify(deviceSwapHistoryReq),
      this.getDataServiceHttpOptions()
    );
  }
  getDeviceDockingHistory(getDeviceDockingHistoryReq: any) {
    return this.httpClient.post<any>(
      this.dataService_url + '/GetDeviceDockingHistory',
      JSON.stringify(getDeviceDockingHistoryReq),
      this.getDataServiceHttpOptions()
    );
  }

  getDeviceMovementAndStatusChangeHistory(deviceMovementHistoryReq: any) {
    return this.httpClient.post<any>(
      this.dataService_url + '/GetDeviceMovementAndStatusChangeHistory',
      JSON.stringify(deviceMovementHistoryReq),
      this.getDataServiceHttpOptions()
    );
  }
  getUserActivity(deviceUserActivityReq: any) {
    return this.httpClient.post<any>(
      this.dataService_url + '/GetUserActivity',
      JSON.stringify(deviceUserActivityReq),
      this.getDataServiceHttpOptions()
    );
  }
  getDeviceCustomAttributes() {
    const deviceCustomAttributes =
      '{"token":"' +
      this.getToken() +
      '","category":"DeviceCustomAttributeLabel"}';
    return this.httpClient.post<any>(
      this.dataService_url + '/GetConfigurationValues',
      deviceCustomAttributes,
      this.getDataServiceHttpOptions()
    );
  }
  getDeviceApplicationAttribute(deviceApplicationAttributesReq: any) {
    const deviceApplicationAttribute =
      '{"token":"' +
      this.getToken() +
      '","getDeviceApplicationAttributesReq":' +
      JSON.stringify(deviceApplicationAttributesReq) +
      '}';
    return this.httpClient.post<any>(
      this.dataService_url + '/GetDeviceApplicationAttribute',
      deviceApplicationAttribute,
      this.getDataServiceHttpOptions()
    );
  }
  getDeviceContactXmlData(getDeviceCommunicationXmlReq: any) {
    const GetDeviceCommunicationXmlReq =
      '{"token":"' +
      this.getToken() +
      '","getDeviceCommunicationXmlReq":' +
      JSON.stringify(getDeviceCommunicationXmlReq) +
      '}';

    return this.httpClient.post<any>(
      this.getDataServiceURL('DeviceCommunicationXml') + '/GetDeviceCommunicationXml',
      GetDeviceCommunicationXmlReq,
      this.getDataServiceHttpOptions()
    );
  }

  getAuditParameterHistory(auditParameterHistoryReq: any) {
    return this.httpClient.post<any>(
      this.dataService_url + '/getAuditParameterHistory',
      JSON.stringify(auditParameterHistoryReq),
      this.getDataServiceHttpOptions()
    );
  }

  getDeviceContactHistory(deviceContactHistoryReq: any) {
    return this.httpClient.post<any>(
      this.dataService_url + '/GetDeviceContactHistory',
      JSON.stringify(deviceContactHistoryReq),
      this.getDataServiceHttpOptions()
    );
  }
  getDeviceCommunicationHistory(deviceCommunicationHistoryReq: any) {
    return this.httpClient.post<any>(
      this.getDataServiceURL('DeviceCommunicationHistory') + '/GetDeviceCommunicationHistory',
      JSON.stringify(deviceCommunicationHistoryReq),
      this.getDataServiceHttpOptions()
    );
  }
  getDownloadJobSummaryForDeviceProfile(
    downloadJobSummaryForDeviceProfileReq: any
  ) {
    return this.httpClient.post<any>(
      this.dataService_url + '/GetDownloadJobSummaryForDeviceProfile',
      JSON.stringify(downloadJobSummaryForDeviceProfileReq),
      this.getDataServiceHttpOptions()
    );
  }
  getDownloadResultsDetailsForDeviceProfile(
    downloadResultsDetailsForDeviceProfileReq: any
  ) {
    return this.httpClient.post<any>(
      this.dataService_url + '/GetDownloadResultsDetailsForDeviceProfile',
      JSON.stringify(downloadResultsDetailsForDeviceProfileReq),
      this.getDataServiceHttpOptions()
    );
  }
  getContentobSummaryForDeviceProfile(
    contentJobSummaryForDeviceProfileReq: any
  ) {
    return this.httpClient.post<any>(
      this.dataService_url + '/GetDownloadJobSummaryForDeviceProfile',
      JSON.stringify(contentJobSummaryForDeviceProfileReq),
      this.getDataServiceHttpOptions()
    );
  }
  getContentResultsDetailsForDeviceProfile(
    contentResultsDetailsForDeviceProfileReq: any
  ) {
    return this.httpClient.post<any>(
      this.dataService_url + '/GetDownloadResultsDetailsForDeviceProfile',
      JSON.stringify(contentResultsDetailsForDeviceProfileReq),
      this.getDataServiceHttpOptions()
    );
  }
  getDiagnosticsJobSummaryForDeviceProfile(
    diagnosticsJobSummaryForDeviceProfileReq: any
  ) {
    return this.httpClient.post<any>(
      this.dataService_url + '/GetDiagnosticsJobSummaryForDeviceProfile',
      diagnosticsJobSummaryForDeviceProfileReq,
      this.getDataServiceHttpOptions()
    );
  }
  getDiagnosticsResultsDetailsForDeviceProfile(
    diagnosticsResultsDetailsForDeviceProfileReq: any
  ) {
    return this.httpClient.post<any>(
      this.dataService_url + '/GetDiagnosticsResultsDetailsForDeviceProfile',
      JSON.stringify(diagnosticsResultsDetailsForDeviceProfileReq),
      this.getDataServiceHttpOptions()
    );
  }
  getVRKJobSummaryForDeviceProfile(vrkJobSummaryForDeviceProfileReq: any) {
    return this.httpClient.post<any>(
      this.dataService_url + '/GetVRKJobSummaryForDeviceProfile',
      JSON.stringify(vrkJobSummaryForDeviceProfileReq),
      this.getDataServiceHttpOptions()
    );
  }
  getVRKDownloadDetailsForDeviceProfile(
    vrkDownloadDetailsForDeviceProfileReq: any
  ) {
    return this.httpClient.post<any>(
      this.dataService_url + '/GetVRKDownloadDetailsForDeviceProfile',
      JSON.stringify(vrkDownloadDetailsForDeviceProfileReq),
      this.getDataServiceHttpOptions()
    );
  }

  deleteOrBlackListDeviceByDeviceUid(UniqueDeviceId: string) {
    const deleteOrBlackListDeviceParams =
      '{"token":"' +
      this.getToken() +
      '","deleteDeviceReq":' +
      JSON.stringify(UniqueDeviceId) +
      '}';
    return this.httpClient.post<any>(
      this.dataService_url + '/DeleteDevice',
      deleteOrBlackListDeviceParams,
      this.getDataServiceHttpOptions()
    );
  }

  updateDevice(updateDevice: string) {
    const swapDeviceParams =
      '{"token":"' +
      this.getToken() +
      '","updateDeviceReq":' +
      JSON.stringify(updateDevice) +
      '}';
    return this.httpClient.post<any>(
      this.dataService_url + '/UpdateDevice',
      swapDeviceParams,
      this.getDataServiceHttpOptions()
    );
  }

  getDeviceSubStatus(substatus: any) {
    const deviceSubStatusParams =
      '{"token":"' +
      this.getToken() +
      '","getDeviceSubStatusReq":' +
      JSON.stringify(substatus) +
      '}';
    return this.httpClient.post<any>(
      this.dataService_url + '/GetDeviceSubStatus',
      deviceSubStatusParams,
      this.getDataServiceHttpOptions()
    );
  }

  activateDeviceParameters(setDeviceParametersReq: any) {
    const activateParamtersParams =
      '{"token":"' +
      this.getToken() +
      '","setDeviceParametersReq":' +
      JSON.stringify(setDeviceParametersReq) +
      '}';
    return this.httpClient.post<any>(
      this.dataService_url + '/SetDeviceParameters',
      activateParamtersParams,
      this.getDataServiceHttpOptions()
    );
  }

  restoreAllDeviceParameters(restoreAllDeviceParametersReq: any) {
    const restoreToDefaultParams =
      '{"token":"' +
      this.getToken() +
      '","restoreAllDeviceParametersReq":' +
      JSON.stringify(restoreAllDeviceParametersReq) +
      '}';
    return this.httpClient.post<any>(
      this.dataService_url + '/RestoreAllDeviceParameters',
      restoreToDefaultParams,
      this.getDataServiceHttpOptions()
    );
  }

  getUserInformationFromToken() {
    const d = new Date();
    const n = d.getTimezoneOffset();
    const gmtDate = new Date();
    const minOffset = -1 * gmtDate.getTimezoneOffset();
    const dtformate = 'dd/MMM/yyyy hh:mm:ss tt';
    const clientInfo: any = new Object();
    clientInfo.ClientDateFormat = dtformate;
    clientInfo.ClientTimeOffset = minOffset;
    const loginParams =
      '{"token":"' +
      this.getToken() +
      '","clientInfo":' +
      JSON.stringify(clientInfo) +
      '}';
    return this.httpClient.post<any>(
      this.dataService_url + '/GetUserInformationFromToken',
      loginParams,
      this.getDataServiceHttpOptions()
    );
  }

  unDeleteDevice(UniqueDeviceId: string) {
    const undeleteDeviceParams =
      '{"token":"' +
      this.getToken() +
      '","updateDeviceStatusReq":' +
      JSON.stringify(UniqueDeviceId) +
      '}';

    return this.httpClient.post<any>(
      this.dataService_url + '/UpdateDeviceStatus',
      undeleteDeviceParams,
      this.getDataServiceHttpOptions()
    );
  }

  updateDeviceDetails(updatedData: string) {
    const serialNumberDeviceIdparams =
      '{"token":"' +
      this.getToken() +
      '","updateDeviceDetailsReq":' +
      JSON.stringify(updatedData) +
      '}';

    return this.httpClient.post<any>(
      this.dataService_url + '/UpdateDeviceDetails',
      serialNumberDeviceIdparams,
      this.getDataServiceHttpOptions()
    );
  }

  getSystemConfigurationToActivateParameters(
    category: string,
    configName: string
  ) {
    const configParams =
      '{"token":"' +
      this.getToken() +
      '", "category":"' +
      category +
      '", "configName":"' +
      configName +
      '"}';
    return this.httpClient.post<any>(
      this.dataService_url + '/GetSystemConfiguration',
      configParams,
      this.getDataServiceHttpOptions()
    );
  }

  getDownloadBundlesForDevice(getDownloadBundlesForDeviceReq: any) {
    const downloadBundlesForDeviceParams =
      '{"token":"' +
      this.getToken() +
      '", "getDownloadBundlesForDeviceReq":' +
      JSON.stringify(getDownloadBundlesForDeviceReq) +
      '}';
    return this.httpClient.post<any>(
      this.dataService_url + '/GetDownloadBundlesForDevice',
      downloadBundlesForDeviceParams,
      this.getDataServiceHttpOptions()
    );
  }

  getFileStatus(getFileStatusReq: any) {
    const fileStatusParams =
      '{"token":"' +
      this.getToken() +
      '", "getFileStatusReq":' +
      JSON.stringify(getFileStatusReq) +
      '}';
    return this.httpClient.post<any>(
      this.dataService_url + '/GetFileStatus',
      fileStatusParams,
      this.getDataServiceHttpOptions()
    );
  }

  cancelJob(cancelJob: any) {
    const cancelJobParams =
      '{"token":"' +
      this.getToken() +
      '","cancelJobReq":' +
      JSON.stringify(cancelJob) +
      '}';
    return this.httpClient.post<any>(
      this.dataService_url + '/CancelJob',
      cancelJobParams,
      this.getDataServiceHttpOptions()
    );
  }

  createRescheduleJob(rescheduleJob: any) {
    const cancelJobParams =
      '{"token":"' +
      this.getToken() +
      '","createRescheduleJobReq":' +
      JSON.stringify(rescheduleJob) +
      '}';
    return this.httpClient.post<any>(
      this.dataService_url + '/CreateRescheduleJob',
      cancelJobParams,
      this.getDataServiceHttpOptions()
    );
  }

  updateDevicePackageDownloadAutomation(updateDeviceAppAutomationFlagReq: any) {
    const devicePackageDownloadAutomationParams =
      '{"token":"' +
      this.getToken() +
      '","updateDeviceAppAutomationFlagReq":' +
      JSON.stringify(updateDeviceAppAutomationFlagReq) +
      '}';
    return this.httpClient.post<any>(
      this.dataService_url + '/UpdateDeviceAppAutomationFlag',
      devicePackageDownloadAutomationParams,
      this.getDataServiceHttpOptions()
    );
  }

  refreshKeysInDevice(keyHandleId: any) {
    const deviceKeysParams =
      '{"token":"' +
      this.getToken() +
      '","uniqueDeviceId":"' +
      this.UniqueDeviceId +
      '", "keyHandleId":"' +
      keyHandleId +
      '"}';
    return this.httpClient.post<any>(
      this.dataService_url + '/RefreshKeyDownload',
      deviceKeysParams,
      this.getDataServiceHttpOptions()
    );
  }

  getSoftwareKeysFileDownload(url: any) {
    return this.httpClient.get<any>(url);
  }

  SetAlertData(alertData: any) {
    const alert =
      '{"token":"' +
      this.getToken() +
      '","setAlertReq":' +
      JSON.stringify(alertData) +
      '}';
    return this.httpClient.post<any>(
      this.dataService_url + '/SetAlert',
      alert,
      this.getDataServiceHttpOptions()
    );
  }

  // GetAlertNotes
  getAlertNotes(deviceAlertId: any) {
    const params =
      '{"token":"' +
      this.getToken() +
      '" ,"deviceAlertId":"' +
      deviceAlertId +
      '"}';
    return this.httpClient.post<any>(
      this.dataService_url + '/GetAlertNotes',
      params,
      this.getDataServiceHttpOptions()
    );
  }

  getDownloadJobsResults(getDownloadResultsReq: any) {
    return this.httpClient.post<any>(
      this.dataService_url + '/GetDownloadResults',
      JSON.stringify(getDownloadResultsReq),
      this.getDataServiceHttpOptions()
    );
  }

  getContentJobsResults(getDownloadResultsReq: any) {
    return this.httpClient.post<any>(
      this.dataService_url + '/GetDownloadResults',
      JSON.stringify(getDownloadResultsReq),
      this.getDataServiceHttpOptions()
    );
  }

  getVRKJobsResults(getVRKDownloadResultsReq: any) {
    return this.httpClient.post<any>(
      this.dataService_url + '/GetVRKDownloadResults',
      JSON.stringify(getVRKDownloadResultsReq),
      this.getDataServiceHttpOptions()
    );
  }

  getDiagnosticJobsResults(getDiagnosticsResultsReq: any) {
    return this.httpClient.post<any>(
      this.dataService_url + '/GetDiagnosticsResults',
      JSON.stringify(getDiagnosticsResultsReq),
      this.getDataServiceHttpOptions()
    );
  }

  getChangeHistoryResults(getAuditHistoryDevicesReq: any) {
    return this.httpClient.post<any>(
      this.dataService_url + '/GetAuditHistoryDevices',
      JSON.stringify(getAuditHistoryDevicesReq),
      this.getDataServiceHttpOptions()
    );
  }

  getDeviceHeartBeatHistory(getDeviceHeartBeatHistoryReq: any) {
    return this.httpClient.post<any>(
      this.getDataServiceURL('DeviceHeartBeatHistory') + '/GetDeviceHeartBeatHistory',
      JSON.stringify(getDeviceHeartBeatHistoryReq),
      this.getDataServiceHttpOptions()
    );
  }

  getConfigurations() {
    const configurationsReq: any = new Object();
    const CategoryConfigValues = [
      {
        ConfigCategory: 'SYSTEM',
        Category: 'SYSTEM',
        ConfigName: AppEnum.GUI_IDLE_TIMEOUT,
      },
      {
        ConfigCategory: 'SYSTEM',
        Category: 'SYSTEM',
        ConfigName: AppEnum.SWAP_APPROVAL_REQUIRED,
      },
      {
        ConfigCategory: 'SYSTEM',
        Category: 'SYSTEM',
        ConfigName: AppEnum.DIRECT_PARAMETER_ACTIVATION,
      },
      {
        ConfigCategory: 'SYSTEM',
        Category: 'SYSTEM',
        ConfigName: AppEnum.CONFIG_NOTIFY_ALERTS_ON_UI,
      },
      {
        ConfigCategory: 'SYSTEM',
        Category: 'SYSTEM',
        ConfigName: AppEnum.CONFIG_ALERT_NOTIFICATION_FREQUENCY,
      },
      {
        ConfigCategory: 'SYSTEM',
        Category: 'SYSTEM',
        ConfigName: AppEnum.INCLUDE_INACTIVE_DEVICES_FOR_SCHEDULING,
      },

      {
        ConfigCategory: 'SYSTEM',
        Category: 'SYSTEM',
        ConfigName: AppEnum.MAXIMUM_HIERARCHIES_PER_USER,
      },
      {
        ConfigCategory: 'SYSTEM',
        Category: 'SYSTEM',
        ConfigName: AppEnum.MAX_SCHEDULE_COUNT_PER_JOB,
      },
      {
        ConfigCategory: 'SYSTEM',
        Category: 'SYSTEM',
        ConfigName: AppEnum.MAX_VRK_FILES_ALLOWED,
      },
      {
        ConfigCategory: 'SYSTEM',
        Category: 'SYSTEM',
        ConfigName: AppEnum.MAX_PACKAGES_PER_REFERENCESET,
      },
      {
        ConfigCategory: 'SYSTEM',
        Category: 'SYSTEM',
        ConfigName: AppEnum.MAX_REFERENCESETS_PER_HIERARCHY,
      },
      {
        ConfigCategory: 'SYSTEM',
        Category: 'SYSTEM',
        ConfigName: AppEnum.HOSTNAME,
      },
      {
        ConfigCategory: 'SYSTEM',
        Category: 'Security',
        ConfigName: AppEnum.PASSWORD_POLICY_NOTE,
      },
      {
        ConfigCategory: 'SYSTEM',
        Category: 'SYSTEM',
        ConfigName: AppEnum.SOFTWARE_PACKAGE_FILE_TYPES,
      },
      // EO Portal Configurations
      {
        ConfigCategory: 'SYSTEM',
        Category: 'EOPortal',
        ConfigName: AppEnum.CONFIG_COMMERCE_PLATFORM_ENABLED,
      },
      {
        ConfigCategory: 'SYSTEM',
        Category: 'EOPortal',
        ConfigName: AppEnum.EOPORTAL_URL,
      },

      {
        ConfigCategory: 'GENERIC',
        Category: AppEnum.CATEGORY_CALLTYPE,
        ConfigName: AppEnum.CATEGORY_CALLTYPE,
      },
      {
        ConfigCategory: 'GENERIC',
        Category: AppEnum.SOFTWARE_PACKAGE_FILE_TYPE,
        ConfigName: AppEnum.SOFTWARE_PACKAGE_FILE_TYPE,
      },
      {
        ConfigCategory: 'GENERIC',
        Category: AppEnum.CONTENT_TARGET_USER_TYPES,
        ConfigName: AppEnum.CONTENT_TARGET_USER_TYPES,
      },
      {
        ConfigCategory: 'GENERIC',
        Category: AppEnum.DEVICE_CONTENT_FILE_NAME,
        ConfigName: AppEnum.DEVICE_CONTENT_FILE_NAME,
      },
      {
        ConfigCategory: 'GENERIC',
        Category: AppEnum.DEVICE_FILE_LOCATION,
        ConfigName: AppEnum.DEVICE_FILE_LOCATION,
      },
      {
        ConfigCategory: 'SYSTEM',
        Category: 'SafetyNets',
        ConfigName: AppEnum.SAFETY_NETS_DEVICE_MOVE,
      },
      {
        ConfigCategory: 'SYSTEM',
        Category: 'SafetyNets',
        ConfigName: AppEnum.SAFETY_NETS_DEVICE_SOFTWARE,
      },
      {
        ConfigCategory: 'SYSTEM',
        Category: 'SafetyNets',
        ConfigName: AppEnum.SAFETY_NETS_DEVICE_PARAMETER,
      },
      {
        ConfigCategory: 'SYSTEM',
        Category: 'SYSTEM',
        ConfigName: AppEnum.SFTP_DISTRIBUTION_CONFIGNAME,
      },
    ];
    configurationsReq.CategoryConfigValues = CategoryConfigValues;
    const params =
      '{"token":"' +
      this.getToken() +
      '","getConfigurationsReq":' +
      JSON.stringify(configurationsReq) +
      '}';
    return this.httpClient.post<any>(
      this.dataService_url + '/GetConfigurations',
      params,
      this.getDataServiceHttpOptions()
    );
  }

  getPeripheralDeviceDetailsResults(peripheralDeviceParams: Object) {
    return this.httpClient.post<any>(
      this.dataService_url + '/GetPeripheralDevicesForDevice',
      JSON.stringify(peripheralDeviceParams),
      this.getDataServiceHttpOptions()
    );
  }

  generateJobName() {
    const params = '{"token":"' + this.getToken() + '"}';
    return this.httpClient.post<any>(
      this.dataService_url + '/GenerateJobName',
      params,
      this.getDataServiceHttpOptions()
    );
  }

  createJob(createJobParams: any) {
    const params =
      '{"token":"' +
      this.getToken() +
      '","createJobReq":' +
      JSON.stringify(createJobParams) +
      '}';
    return this.httpClient.post<any>(
      this.dataService_url + '/CreateJob',
      params,
      this.getDataServiceHttpOptions()
    );
  }

  logOut(logoutReason: any) {
    const params =
      '{"token":"' +
      this.getToken() +
      '","logoutReason":"' +
      logoutReason +
      '"}';
    return this.httpClient.post<any>(
      this.dataService_url + '/Logout',
      params,
      this.getDataServiceHttpOptions()
    );
  }
  assignDevicesToGroups(assignDevicesToGroupsReq: any) {
    const params =
      '{"token":"' +
      this.getToken() +
      '","assignDevicesToGroupsReq":' +
      JSON.stringify(assignDevicesToGroupsReq) +
      '}';
    return this.httpClient.post<any>(
      this.dataService_url + '/AssignDevicesToGroups',
      params,
      this.getDataServiceHttpOptions()
    );
  }
  removeDeviceFromGroup(deviceGroup: any) {
    const params =
      '{"token":"' +
      this.getToken() +
      '","deviceGroup":' +
      JSON.stringify(deviceGroup) +
      '}';
    return this.httpClient.post<any>(
      this.dataService_url + '/RemoveDeviceFromGroup',
      params,
      this.getDataServiceHttpOptions()
    );
  }
  getParameterSynchronizationDetails(
    getParameterSynchronizationDetailsReq: any
  ) {
    const params =
      '{"token":"' +
      this.getToken() +
      '","getParameterSynchronizationDetailsReq":' +
      JSON.stringify(getParameterSynchronizationDetailsReq) +
      '}';
    return this.httpClient.post<any>(
      this.dataService_url + '/GetParameterSynchronizationDetails',
      params,
      this.getDataServiceHttpOptions()
    );
  }

  getTrafficLightDetails(uid: any) {
    const params =
      '{"token":"' +
      this.getToken() +
      '","GetDeviceHealthIndicatorsReq":{"UniqueDeviceId":' +
      uid +
      '}}';
    return this.httpClient.post<any>(
      this.dataService_url + '/GetDeviceHealthKeyIndicators',
      params,
      this.getDataServiceHttpOptions()
    );
  }

  getParameterSyncDetails(getParameterApplicationsReq: any) {
    const params =
      '{"token":"' +
      this.getToken() +
      '","getParameterApplicationsReq":' +
      JSON.stringify(getParameterApplicationsReq) +
      '}';
    return this.httpClient.post<any>(
      this.dataService_url + '/GetParameterApplicationsForDevice',
      params,
      this.getDataServiceHttpOptions()
    );
  }

  getSeedInfo(uid: any) {
    const params =
      '{"token":"' +
      this.getToken() +
      '","seedInfoReq":{"UniqueDeviceId":' +
      uid +
      '}}';
    return this.httpClient.post<any>(
      this.dataService_url + '/AuthSeedInfo',
      params,
      this.getDataServiceHttpOptions()
    );
  }

  generatePassCode(seed: string, date: string) {
    const req = {
      Seed: seed,
      Date: date,
    };
    const params =
      '{"token":"' +
      this.getToken() +
      '","generatePasscodeReq":' +
      JSON.stringify(req) +
      '}';
    return this.httpClient.post<any>(
      this.dataService_url + '/GeneratePassCode',
      params,
      this.getDataServiceHttpOptions()
    );
  }

  getDeviceEncryptionKeysValues(uid: string) {
    const req: any = {};
    req.UniqueDeviceId = uid;
    const params =
      '{"token":"' +
      this.getToken() +
      '","getDeviceEncryptionKeysReq":' +
      JSON.stringify(req) +
      '}';
    return this.httpClient.post<any>(
      this.dataService_url + '/GetDeviceEncryptionKeysValues',
      params,
      this.getDataServiceHttpOptions()
    );
  }

  getDeviceCertificates(uniqueDeviceId: string) {
    const params =
      '{"token":"' +
      this.getToken() +
      '","uniqueDeviceId":' +
      uniqueDeviceId +
      '}';
    return this.httpClient.post<any>(
      this.dataService_url + '/GetDeviceCertificates',
      params,
      this.getDataServiceHttpOptions()
    );
  }

  getGridColumnWidth(
    getGridColumnWidthReq: any
  ) {
    const params =
      '{"token":"' +
      this.getToken() +
      '","getUserPreferencesColumnWidthDetailsReq":' +
      JSON.stringify(getGridColumnWidthReq) +
      '}';
    return this.httpClient.post<any>(
      this.dataService_url + '/GetUserPreferencesWidthDetails',
      params,
      this.getDataServiceHttpOptions()
    );
  }

  getDeviceContactHistoryData(getDeviceContactHistoryReq: object) {
    const devicedata =
      '{"token":"' +
      this.getToken() +
      '","getDeviceContactHistoryReq":' +
      JSON.stringify(getDeviceContactHistoryReq) +
      '}';

    return this.httpClient.post<any>(
      this.dataService_url + '/GetDeviceContactHistory',
      devicedata,
      this.getDataServiceHttpOptions()
    );
  }

  getDeviceHeartBeatCount(getDeviceHeartBeatHistoryReq: object) {
    const devicedata =
      '{"token":"' +
      this.getToken() +
      '","getDeviceContactHistoryReq":' +
      JSON.stringify(getDeviceHeartBeatHistoryReq) +
      '}';

    return this.httpClient.post<any>(
      this.getDataServiceURL('DeviceContactHistory') + '/GetDeviceContactHistory',
      devicedata,
      this.getDataServiceHttpOptions()
    );
  }
  Clicked(eventdata: Eventdata) {
    this.ClickedEvent.emit(eventdata);
  }
}

export class Eventdata {
  public eventName: string;
  public eventValue: any;
}
