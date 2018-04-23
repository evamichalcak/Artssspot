import React from 'react';
import { StyleSheet, Text, View, Button, ListView, TextInput, FlatList, TouchableHighlight } from 'react-native';
import { createStore, combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';

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


let nextTodoId = 0;

class Link extends React.Component {
  render() {
    if  (this.props.active) {
      return <Text style={{fontWeight: 'bold'}}>{this.props.text}</Text>;
    }
    return (
      <TouchableHighlight onPress={() => {this.props.onClick()}}>
        <Text>{this.props.text}</Text>
      </TouchableHighlight>
    );
  }
}

const mapStateToLinkProps = (state, ownProps) => {
  return {
    active: ownProps.filter === state.visibilityFilter
  };
};
const mapDispatchToLinkPorps = (dispatch, ownProps) => {
  return {
    onClick: () => {
      dispatch({
        type: 'SET_VISIBILITY_FILTER',
        filter: ownProps.filter
      })
    }
  };
};
const FilterLink = connect(
  mapStateToLinkProps,
  mapDispatchToLinkPorps
)(Link);


class TodoList extends React.Component {
  render() {
    return (
      <ListView
      dataSource={this.props.dataSource}
      renderRow={(rowData) => 
          <Todo 
            completed={rowData.completed} 
            text={rowData.text} 
            onClick={() => {this.props.onTodoClick(rowData.id)}} 
          />
        }
      />
    );
  }
}

class Todo extends React.Component {
  render() {
    return (
      <TouchableHighlight onPress={this.props.onClick}>
        <Text style={{
          textDecorationLine: this.props.completed ? 'line-through' : 'none', 
          textDecorationStyle: 'solid'
        }}>{this.props.text} + {this.props.completed + ''}</Text>
      </TouchableHighlight>
    );
  }
}


const mapStateToTodoListProps = (state) => {
  const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
  let dataSource = ds.cloneWithRows(getVisibleTodos(state.todos, state.visibilityFilter));
  return {
    todos: getVisibleTodos(
      state.todos,
      state.visibilityFilter,
    ),
    dataSource
  };
};
const mapDispatchToTodoListPorps = (dispatch) => {
  return {
    onTodoClick: (id) => {
      dispatch({
        type: 'TOGGLE_TODO',
        id
      })
    }
  };
};
const VisibleTodoList = connect(
  mapStateToTodoListProps,
  mapDispatchToTodoListPorps
)(TodoList);



class AddTodo extends React.Component {

  render() {
  let input;
    return (
      <View>
        <TextInput 
            ref={component => input = component } 
            style={styles.input}
            autoCapitalize={'none'}
            onChangeText={(todoname) => this.setState({todoname})}
        />
        <Button
          onPress={() => { 
            input.setNativeProps({text: ''});
            this.props.dispatch({
                type: 'ADD_TODO',
                text: this.state.todoname,
                id: nextTodoId++,
              });
          }}
          title="Add To Do"
          color="#841584"
        />
      </View>
    );
  }
};
AddTodo = connect()(AddTodo);


class Footer extends React.Component {
  render() {
    return (
      <View>
        <FilterLink text='All' filter='SHOW_ALL' />
        <FilterLink text='Active' filter='SHOW_ACTIVE' />
        <FilterLink text='Completed' filter='SHOW_COMPLETED' />
      </View>
    );
  }
}




export default class App extends React.Component {

  render() {
    return (
      <Provider store={createStore(todoApp)}>
        <View style={styles.container}>

          <AddTodo />

          <VisibleTodoList />

          <Footer />

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
