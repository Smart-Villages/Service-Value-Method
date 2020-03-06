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
import './ConfigureRows.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import {RATING_TYPE_BETTER_WORSE, RATING_TYPE_EASIER_HARDER, RATING_TYPE_LOWER_HIGHER} from "../Constants";

/**
 * Ask the user which ones of the rows are not participants but either decision criteria or the importance (used for the
 * colors of the bubbles). The user has to mark at least two rows to be decision criteria (for the two axis). The user
 * can optionally select more than two. For each decision criterion the user can also select what labels to use for the
 * axis, so either better / worse -OR- easier / harder -OR- lower / higher.
 */
class ConfigureRows extends React.Component {
  /**
   * Initialize the state.
   *
   * @param props
   */
  constructor(props) {
    super(props);

    this.state = {
      participants: props.participants || props.data,
      bubbleSizes: props.bubbleSizes || null,
      decisionCriteria: props.decisionCriteria || [],
    };
  }

  /**
   * Default render() callback.
   *
   * @returns {*}
   */
  render() {
    const TYPE_PARTICIPANT = "Participant";
    const TYPE_DECISION_CRITERION = "Decision-Criterion";
    const TYPE_BUBBLE_SIZES = "Bubble-Sizes";
    const TYPE_IGNORE = "Ignore";

    const getIndex = (v,a) => {
      let index = -1;

      a.forEach((item,i)=> {
        if(item.name === v.name) {
          index = i;
        }
      });

      return index;
    };

    const isIn = (v,a) => {
      return a.filter((i)=> {
        return i.name === v.name;
      }).length>0;
    };

    const update = (item, type, before) => {
      if(before===type) {
        return;
      }

      const remove = (i, a) => {
        return a.filter(item=> {
          return item.name!==i.name;
        });
      };

      if(type===TYPE_IGNORE) {
        if(this.state.bubbleSizes && this.state.bubbleSizes.name===item.name) {
          this.setState({
            bubbleSizes: null,
          });
        }
        else {
          this.setState({
            participants: remove(item, this.state.participants),
            decisionCriteria: remove(item, this.state.decisionCriteria),
          });
        }
      }
      else if(type===TYPE_BUBBLE_SIZES) {
        if(this.state.bubbleSizes) {
          this.setState({
            participants: remove(item, this.state.participants.concat([this.state.bubbleSizes])),
            decisionCriteria: remove(item, this.state.decisionCriteria),
            bubbleSizes: item,
          });
        }
        else {
          this.setState({
            participants: remove(item, this.state.participants),
            decisionCriteria: remove(item, this.state.decisionCriteria),
            bubbleSizes: item,
          });
        }
      }
      else if(type===TYPE_PARTICIPANT) {
        if(before===TYPE_BUBBLE_SIZES) {
          this.setState({
            bubbleSizes: null,
          });
        }
        else if(before===TYPE_DECISION_CRITERION) {
          this.setState({
            decisionCriteria: remove(item, this.state.decisionCriteria),
          });
        }

        this.setState({
          participants: this.state.participants.concat(item),
        });
      }
      else if(type===TYPE_DECISION_CRITERION) {
        if(before===TYPE_BUBBLE_SIZES) {
          this.setState({
            bubbleSizes: null,
          });
        }
        else if(before===TYPE_PARTICIPANT) {
          this.setState({
            participants: remove(item, this.state.participants),
          });
        }

        this.setState({
          decisionCriteria: this.state.decisionCriteria.concat(item),
        });
      }
    };

    const options = this.props.data.map((item, index) => {
      const type = isIn(item, this.state.participants) ? TYPE_PARTICIPANT : (isIn(item, this.state.decisionCriteria) ? TYPE_DECISION_CRITERION : (this.state.bubbleSizes && this.state.bubbleSizes.name===item.name ? TYPE_BUBBLE_SIZES : TYPE_IGNORE));

      return (
        <div className={`Option Type-${type}`} key={index}>
          <Row>
            <Col xs={4} className={"Row-Name"}>
              {item.name}
            </Col>
            <Col xs={8}>
                <ToggleButtonGroup type="radio" name={`type-${index}`} value={type}>
                  <ToggleButton value={TYPE_PARTICIPANT} onChange={()=>update(item,TYPE_PARTICIPANT,type)}>Participant</ToggleButton>
                  <ToggleButton value={TYPE_DECISION_CRITERION} onChange={()=>update(item,TYPE_DECISION_CRITERION,type)}>Decision criterion</ToggleButton>
                  <ToggleButton value={TYPE_BUBBLE_SIZES} onChange={()=>update(item,TYPE_BUBBLE_SIZES,type)}>Importance</ToggleButton>
                  <ToggleButton value={TYPE_IGNORE} onChange={()=>update(item,TYPE_IGNORE,type)}>Ignore</ToggleButton>
                </ToggleButtonGroup>

              {type===TYPE_DECISION_CRITERION ?
                (
                  <DropdownButton alignRight={true} variant="secondary" id={`dropdown-type-${index}`} title={'Type'}>
                    {
                      [RATING_TYPE_BETTER_WORSE, RATING_TYPE_LOWER_HIGHER, RATING_TYPE_EASIER_HARDER].map((type)=> {
                        const active = type===RATING_TYPE_BETTER_WORSE ?
                          (item._ratingType!==RATING_TYPE_LOWER_HIGHER && item._ratingType!==RATING_TYPE_EASIER_HARDER) :
                          (item._ratingType===type);

                        return (
                          <Dropdown.Item active={active} key={`type-${type}`} onClick={event=> {
                            event.preventDefault();
                            const decisionCriteria = this.state.decisionCriteria;
                            const index = getIndex(item,decisionCriteria);
                            decisionCriteria[index]._ratingType = type;
                            this.setState({
                              decisionCriteria: decisionCriteria,
                            });
                          }}>{type}</Dropdown.Item>
                        );
                      })
                    }
                  </DropdownButton>
                ) : undefined}
            </Col>
          </Row>
        </div>
      );
    });

    return (
      <div className="App-Rows">
        <div className="App-Header">
          <a href="#back" onClick={(e) => {
            e.preventDefault();

            this.props.back();
          }}>Back</a>

          <h1>Step 3/3: Type rows</h1>

          <div>&nbsp;</div>
        </div>

        <p>Which of the following rows are not participants?</p>

        <Form>
          {options}

          <p>
            {this.state.decisionCriteria.length >= 2 ?
              (
                <Button variant="primary" onClick={() => {
                  const serviceVotes = {};
                  const serviceVoters= {};

                  this.props.selectedServices.forEach(service=> {
                    serviceVotes[service] = 0;
                    serviceVoters[service] = 0;

                    this.state.participants.forEach(participant => {
                      if(participant[service]) {
                        serviceVoters[service]++;
                      }

                      serviceVotes[service] += participant[service];
                    });
                  });

                  this.props.onDone({
                    participants: this.state.participants,
                    bubbleSizes: this.state.bubbleSizes,
                    decisionCriteria: this.state.decisionCriteria,
                    serviceVotes: serviceVotes,
                    serviceVoters: serviceVoters,
                  });
                }}>Continue</Button>
              ) :
              "Please select at least two decision criteria."
            }
          </p>
        </Form>
      </div>
    );
  }
}

export default ConfigureRows;
