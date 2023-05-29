const fs = require('fs');
const xmlrpc = require('xmlrpc-lite');

const url = 'http://qoshan.odoo.com';  
const db = 'qoshan';  
const username = 'laith@hst.jo';  
const password = '210@Carringtonrd'; 

const client = xmlrpc.createSecureClient({ url: `${url}/xmlrpc/2/common` });

client.methodCall('authenticate', [db, username, password, {}], (error, uid) => {
  if (error) {
    console.error('Authentication Error:', error);
    return;
  }

  const models = xmlrpc.createSecureClient({ url: `${url}/xmlrpc/2/object` });

  const model = 'x_crm';  

  const fields = ['x_name', 'x_studio_sale_price', 'x_studio_many2one_field_YbLip', 'x_studio_featured_url', 'x_studio_property_id', 'x_studio_property_area', 'x_studio_land_area', 'x_studio_bedrooms', 'x_studio_bathrooms_1', 'x_studio_garages', 'x_studio_status', 'x_studio_type', 'x_studio_price_prefix', 'x_studio_property_information', 'x_studio_featured_property', 'x_studio_view_on_slider', 'x_studio_many2many_field_k2sqN'];

  models.methodCall('execute_kw', [db, uid, password, model, 'search_read', [[]], { fields: fields }], (error, entries) => {
    if (error) {
      console.error('Search Error:', error);
      return;
    }

    const fetchMany2OneName = (entry, fieldName) => {
      const relatedRecord = entry[fieldName];
      if (relatedRecord && relatedRecord[0]) {
        const relatedRecordId = relatedRecord[0];
        const relatedRecordName = relatedRecord[1].x_name;
        return relatedRecordName;
      }
      return '';
    };

    const fetchMany2ManyNames = async (entry, fieldName) => {
      const relatedRecords = entry[fieldName];
      if (relatedRecords && relatedRecords.length > 0) {
        const relatedRecordIds = relatedRecords.map(record => record[0]);
        const relatedRecordFields = ['x_name']; 

        const domain = [['id', 'in', relatedRecordIds]];
        const relatedRecordEntries = await models.methodCall('execute_kw', [db, uid, password, 'x_property_features', 'search_read', [domain], { fields: relatedRecordFields }]);
        const relatedRecordNames = relatedRecordEntries.map(record => record.x_name || 'Unknown');
        return relatedRecordNames;
      }
      return [];
    };

    const modifiedEntries = entries.map(entry => ({
      ...entry,
      x_cities: fetchMany2OneName(entry, 'x_studio_many2one_field_YbLip'),
      x_features: fetchMany2ManyNames(entry, 'x_studio_many2many_field_k2sqN'),
    }));

    const jsonData = JSON.stringify(modifiedEntries, null, 2);

    fs.writeFile('data.json', jsonData, 'utf8', (error) => {
      if (error) {
        console.error('Write File Error:', error);
      } else {
        console.log('Data has been saved to data.json');
      }

      client.methodCall('logout', [db, uid, password], (error) => {
        if (error) {
          console.error('Logout Error:', error);
        }
      });
    });
  });
});
