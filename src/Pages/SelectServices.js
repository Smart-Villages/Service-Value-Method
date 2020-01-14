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
import './SelectServices.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

/**
 * Ask the user to deselect columns that are not services or shouldn't be included and provide the list of selected
 * services back to the parent component.
 */
class SelectServices extends React.Component {
  /**
   * Initialize the state of the component.
   *
   * @param props
   */
  constructor(props) {
    super(props);

    this.state = {
      selectedServices: props.services,
    };
  }

  /**
   * Default render() callback.
   *
   * @returns {*}
   */
  render() {
    const options = this.props.services.map((name, index) => {
      const checked = this.state.selectedServices.indexOf(name)>=0;

      return (
        <div className="Option" key={index}>
          <Form.Check type="checkbox" id={`option-${index}`} label={name} checked={checked} onChange={() => {
            if(checked) {
              this.setState({
                selectedServices: this.state.selectedServices.filter(serviceName=> {
                  return serviceName!==name;
                }),
              });
            }
            else {
              this.setState({
                selectedServices: this.state.selectedServices.concat([name]),
              });
            }
          }} />
        </div>
      );
    });

    return (
      <div className="App-Data">
        <h1>Step 2/3: Refine options</h1>
        <p>Which of the following options would you like to display in the diagram?</p>

        <Form>
          {options}

          <p>
            <Button variant="primary" onClick={()=> {
              this.props.onDone({
                selectedServices: this.state.selectedServices,
              });
            }}>Continue</Button>
          </p>
        </Form>
      </div>
    );
  }
}

export default SelectServices;
