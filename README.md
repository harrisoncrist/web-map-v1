# web-map-v1
A. I obtained the data for this project through the 
Federal Financial Institutions Examination Council's 
<a href = "https://ffiec.cfpb.gov/data-browser/data/2018?category=counties&items=36005,36061,36081,36047,36085&actions_taken=6&loan_purposes=1&getDetails=1">Home Mortgage Disclosure Act online database</a>. The following filters were used to retrieve data for 2018 and 2023:
1. Year: 2018/2023
2. County: Bronx County, NY; Kings County, NY; New York County, NY; Richmond County, NY; Queens County, NY.
3. Action Taken: Purchased loan
4. Loan Purpose: Home purchase

B. I downloaded the 2018 and 2023 data, then cleaned and joined them using R.

C. I then used QGIS to match the HMDA data with NYC census tract shapefiles.

D. I uploaded the geocoded HMDA data as a GEOJSON into VSCode to create the webmap. 

E. I derived the choropleth color scale for the 2018 and 2023 layers using the Natural Break scale in QGIS. 

