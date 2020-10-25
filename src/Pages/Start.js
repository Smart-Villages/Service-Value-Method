/**
 * Service Value Method:  Provide visual indications what services to focus on given a list of participants with their
 *                        choices and additional decision criteria.
 *
 * @license AGPL-3.0-or-later
 *
 * Copyright (C) 2020 Thiemo Müller
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import CSVReader from 'react-csv-reader';
import './Start.css';
import 'bootstrap/dist/css/bootstrap.min.css';

/**
 * Provide a short introduction text with instructions on how to use it along with an example table. Ask the user to
 * "upload" a CSV file. CSV is parsed locally, so not actually uploaded.
 * Data is parsed through a library and provided back to the parent component.
 */
class Start extends React.Component {
  /**
   * Initialize the state. Load the external HTML files.
   *
   * @param props
   */
  constructor(props) {
    super(props);

    this.state = {
      instructions: "",
      footer: "",
    };

    const loadHtml = (name) => {
      fetch(`/${name}.html`)
        .then(res => res.text())
        .then(
          (result) => {
            this.setState({
              [name]: result,
            });
          },
          (error) => {
            this.setState({
              [name]: `<em class='error'>Failed to load ${name}.</em>`,
            });
          }
        );
    };

    loadHtml("instructions");
    loadHtml("footer");
  }

  /**
   * Default render() callback.
   *
   * @returns {*}
   */
  render() {
    /**
     * We're using `dangerouslySetInnerHTML` where the HTML is loaded from a file that's on the same web server, so it
     * doesn't introduce any additional security risks.
     */
    return (
      <div className="App-Start">
        <h1>Step 1/3: Upload CSV file</h1>
        <div dangerouslySetInnerHTML={{
          __html: this.state.instructions
        }} />

        <h2>Get started:</h2>
        <div className="App-Upload">
          <div className="Background">Upload...</div>
          <CSVReader onFileLoaded={data => {
            data = data.filter(item => {
              return item.length>1 && item.filter(value => {
                return !!value
              }).length;
            });

            if(data.length<4) {
              alert("The file you uploaded doesn't contain enough data. It requires at least 4 rows.");
              return;
            }

            let headers = data[0];

            let result = [];

            let unknownValues = [];

            for(let i=1; i<data.length; i++) {
              let row = {
                name: data[i][0],
              };

              let n=1;

              for(; n<data[i].length; n++) {
                if(n===headers.length) {
                  alert("You are missing the "+n+"th header row. Please enter a name for this service.");
                  return;
                }

                if(headers[n]==="name") {
                  alert("A service can't be named 'name'.");
                  return;
                }

                let value = data[i][n];

                value = value.replace( /,/, ".");

                if(value==="x" || value.match(/^\s*$/)) {
                  value = 0;
                }
                else if(value.match(/^[0-9]+\.?[0-9]*$/)) {
                  value = parseFloat(value);
                }
                else {
                  unknownValues.push(value);
                  value = 0;
                }

                row[
                  headers[n]
                  ] = value;
              }

              for(; n<headers.length; n++) {
                row[
                  headers[n]
                  ] = 0;
              }

              result.push(row);
            }

            this.props.onDone({
              services: headers.slice(1),
              data: result,
            })
          }}/>
        </div>

        <div dangerouslySetInnerHTML={{
          __html: this.state.footer
        }} />
      </div>
    );
  }
}

export default Start;
