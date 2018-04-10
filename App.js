import React from 'react';
import { StyleSheet, Text, View, Button, ListView, TextInput, FlatList, TouchableHighlight } from 'react-native';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';

const todo = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false
      }
    case 'TOGGLE_TODO': 
      if (state.id !== action.id) {
        return state;
      } 
      return {
        ...state,
        completed: !state.completed
      };
    default:
      return state;
  }
};

const todos = (state=[], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
      ...state,
      todo(undefined, action)
      ]
    case 'TOGGLE_TODO': 
      return state.map(t => 
          todo(t, action)
        );
    default:
      return state;
  }
};

const visibilityFilter = (state = 'SHOW_ALL', action) => { 
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
};

const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_ALL': 
      return todos;
    case 'SHOW_COMPLETED':
      return todos.filter(
        t => t.completed
      );
    case 'SHOW_ACTIVE':
      return todos.filter(
        t => !t.completed
      );
  }
}

const todoApp = combineReducers({todos, visibilityFilter});

const store = createStore(todoApp);

//store.subscribe(render);
store.subscribe((action) => {
    console.log(store.getState());
  });

let nextTodoId = 5;

class FilterLink extends React.Component {
  render() {
    if  (this.props.currentfilter === this.props.filter) {
      return <Text style={{fontWeight: 'bold'}}>{this.props.text}</Text>;
    }
    return (
   <TouchableHighlight onPress={() => {
    this.props.store.dispatch({
        type: 'SET_VISIBILITY_FILTER',
        filter: this.props.filter,
      });
   }}>
      <Text>{this.props.text}</Text>
    </TouchableHighlight>);
  }
}

export default class App extends React.Component {

constructor() {
    super();
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.store = store;
    this.todos = getVisibleTodos(this.store.getState().todos, this.store.getState().visibilityFilter);
    this.currentfilter = this.store.getState().visibilityFilter;
    // this.store.subscribe(() => {
    //   this.todos = this.store.getState().todos;
    // });
    this.store.subscribe(() => {
      let todos = getVisibleTodos(this.store.getState().todos, this.store.getState().visibilityFilter);
      this.state.dataSource = ds.cloneWithRows(todos);
      this.currentfilter = this.store.getState().visibilityFilter;
    });
    //this.dataSource = dataSource: ds.cloneWithRows(this.todos),
    this.state = {
      dataSource: ds.cloneWithRows(this.todos),
    };
  }
  
_onPressButton() {
  console.log('pressed');
}

  render() {
    return (
      <Provider store={store}>
        <View style={styles.container}>
          <TextInput 
            ref={component => this._textInput = component } 
            style={styles.input}
            autoCapitalize={'none'}
            onChangeText={(todoname) => this.setState({todoname})} />
          <Button
            onPress={() => { this.store.dispatch({
              type: 'ADD_TODO',
              text: this.state.todoname,
              id: nextTodoId++,
            });
            this._textInput.setNativeProps({text: ''});
            console.log(this.todos);
          }}
            title="Add To Do"
            color="#841584"
          />
          <ListView
            dataSource={this.state.dataSource}
            renderRow={(rowData) => 
                <TouchableHighlight onPress={() => this.store.dispatch({
                  type: 'TOGGLE_TODO',
                  id: rowData.id,
                })}>
                  <Text style={{textDecorationLine: rowData.completed ? 'line-through' : 'none', textDecorationStyle: 'solid'}}>{rowData.text} + {rowData.completed + ''}</Text>
                </TouchableHighlight>
              }
          />
          <FilterLink text='All' filter='SHOW_ALL' store={this.store} currentfilter={this.currentfilter} />
          <FilterLink text='Active' filter='SHOW_ACTIVE' store={this.store} currentfilter={this.currentfilter} />
          <FilterLink text='Completed' filter='SHOW_COMPLETED' store={this.store} currentfilter={this.currentfilter} />
          <Text>Open up App.js to start working on your app!</Text>
          <Text>Changes you make will automatically reload.</Text>
          <Text>Shake your phone to open the developer menu.</Text>
          <Text>with redux</Text>
        </View>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width:200, 
    height:50,
  }
});
