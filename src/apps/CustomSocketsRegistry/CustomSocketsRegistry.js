import React from 'react';
import { withRouter } from 'react-router';
import Reflux from 'reflux';
import Helmet from 'react-helmet';
import _ from 'lodash';

import InstancesActions from '../Instances/InstancesActions';
import DialogActions from '../CustomSockets/CustomSocketsActions';
import Actions from './CustomSocketsRegistryActions';
import Store from './CustomSocketsRegistryStore';

import { Show } from '../../common/';

import SocketsRegistryInnerToolbar from './SocketsRegistryInnerToolbar';
import CustomSocketInstallDialog from './CustomSocketsRegistryDialog';
import SocketsSearchBar from './SocketsSearchBar';

const CustomSocketsRegistry = React.createClass({
  mixins: [
    Reflux.connect(Store)
  ],

  componentDidMount() {
    InstancesActions.fetch();
    Actions.fetchCustomSocketsRegistry();
    if (this.props.location.query) {
      DialogActions.showDialog();
    }
  },

  handleChangeSearchTerm(term) {
    this.setState({ term: term.target.value, changeListView: true });
  },

  handleStartFilter() {
    const { searchClicked } = this.state;

    if (!searchClicked) {
      this.setState({ filter: 'all', searchClicked: true });
    }
  },

  filteredData() {
    const { items, filter } = this.state;
    const filteredByAuthor = filter === 'all' ? items : _.filter(items, { by_syncano: filter });
    const filterResult = this.filterByType(filteredByAuthor);

    return filterResult;
  },

  filterByType(items) {
    const { term, filterBySyncano } = this.state;
    const searchTerm = term && term.toLowerCase();

    if (filterBySyncano === 'all') {
      const filterByType = _.filter(items, (item) => {
        const isName = _.includes(item.author.toLowerCase(), searchTerm);
        const isAuthor = _.includes(item.description.toLowerCase(), searchTerm);
        const isDescription = _.includes(item.name.toLowerCase(), searchTerm);

        return isName || isAuthor || isDescription;
      });

      return filterByType;
    }
    const filterByType = _.filter(items, (item) => _.includes(item[filterBySyncano].toLowerCase(), searchTerm));

    return filterByType;
  },


  render() {
    const { children, location } = this.props;
    const { term, items, isLoading, searchClicked, changeListView, filter, filterBySyncano } = this.state;
    const socketUrl = location.query.socket_url;

    return (
      <div>
        <Helmet title="Custom Sockets Registry" />
        <CustomSocketInstallDialog
          shouldRedirect={true}
          url={socketUrl}
        />
        <SocketsSearchBar
          items={items}
          onClick={this.handleStartFilter}
          handleChangeSearchTerm={this.handleChangeSearchTerm}
          value={term}
        />
        <Show if={searchClicked}>
          <SocketsRegistryInnerToolbar
            filter={filter}
            filterBySyncano={filterBySyncano}
          />
        </Show>

        {children && React.cloneElement(children, { changeListView, term, items, isLoading, filter, filterBySyncano })}
      </div>
    );
  }
});

export default withRouter(CustomSocketsRegistry);