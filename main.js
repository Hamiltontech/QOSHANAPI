const fs = require('fs');
const xmlrpc = require('xmlrpc');

// Odoo instance details
const url = 'http://qoshan.odoo.com';  // Replace with your Odoo server URL
const db = 'qoshan';  // Replace with your database name
const username = 'laith@hst.jo';  // Replace with your Odoo username
const password = '210@Carringtonrd';  // Replace with your Odoo password

// XML-RPC client connection
const client = xmlrpc.createClient({ url: `${url}/xmlrpc/2/common` });

// Authenticate and retrieve user ID
client.methodCall('authenticate', [db, username, password, {}], (error, uid) => {
  if (error) {
    console.error('Authentication Error:', error);
    return;
  }

  // XML-RPC client connection for models
  const models = xmlrpc.createClient({ url: `${url}/xmlrpc/2/object` });

  // Model to view
  const model = 'x_crm';  // Replace with the actual name of the Odoo model

  // Fields to retrieve
  const fields = ['x_name', 'x_studio_sale_price', 'x_studio_many2one_field_YbLip', 'x_studio_featured_url', 'x_studio_property_id', 'x_studio_property_area', 'x_studio_land_area', 'x_studio_bedrooms', 'x_studio_bathrooms_1', 'x_studio_garages', 'x_studio_status', 'x_studio_type', 'x_studio_price_prefix', 'x_studio_property_information', 'x_studio_featured_property', 'x_studio_view_on_slider', 'x_studio_many2many_field_k2sqN', 'x_studio_property_images'];  

  // Retrieve all entries from the model with specified fields
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

// Function to fetch the names of Many2many field items
// Function to fetch the names of Many2many field items
const fetchMany2ManyNames = (entry, fieldName) => {
    const relatedRecords = entry[fieldName];
    if (relatedRecords && relatedRecords.length > 0) {
      const relatedRecordNames = relatedRecords.map(record => record[1].x_name || 'Unknown');
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

    // Write data to data.json file
    fs.writeFile('data.json', jsonData, 'utf8', (error) => {
      if (error) {
        console.error('Write File Error:', error);
      } else {
        console.log('Data has been saved to data.json');
      }

      // Close the XML-RPC connection
      client.methodCall('logout', [db, uid, password], (error) => {
        if (error) {
          console.error('Logout Error:', error);
        }
      });
    });
  });
});