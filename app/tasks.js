import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert } from "react-native";
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Task } from "../src/components/Task";
import { Input } from "../src/components/Input";
import { Button } from "../src/components/Button";
import { api } from '../src/api/api';

/** Tela de Tarefas */
export default function Page() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const disabledButton = title === '';

  useEffect(() => {
    handleGetTasks();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@tasks-app/token');
      router.replace('/');
    } catch (error) {
      console.error(error);
    }
  }

  const handleGetTasks = async () => {
    try {
      setLoading(true);
      const accessToken = await AsyncStorage.getItem('@tasks-app/token');
      const result = await api.get('/tasks', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setTasks(result.data);
    } catch (error) {
      Alert.alert('There was an error', error.response.data.error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateTask = async () => {
    try {
      setLoading(true);
      const accessToken = await AsyncStorage.getItem('@tasks-app/token');
      await api.post('/task', { title }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      await handleGetTasks();
      setTitle('');
    } catch (error) {
      Alert.alert('There was an error', error.response.data.error);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteTask = async (id) => {
    try {
      const token = await AsyncStorage.getItem('@tasks-app/token');

      if (!token) {
        console.error('Error: authentication token not found!');
        return;
      }

      const apiUrl = 'https://tasks-api-node.vercel.app';
      const deleteTaskUrl = `${apiUrl}/Task/${id}`;

      const requestOptions = {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const response = await fetch(deleteTaskUrl, requestOptions);

      if (response.ok) {
        console.log('The task was deleted');
        await handleGetTasks(); // Refresh the task list after deletion
      } else {
        console.error('Error: The task was not deleted', response.statusText);
      }
    } catch (error) {
      console.error('Error: Process the request', error.message);
    }
  }

  const handleCheckTask = async (id, finished) => {
    try {
      const token = await AsyncStorage.getItem('@tasks-app/token');

      if (!token) {
        console.error('Error: authentication token not found!');
        return;
      }

      const apiUrl = 'https://tasks-api-node.vercel.app';
      const chekTaskUrl = `${apiUrl}/task/${id}`;
      const requestBody = JSON.stringify({ finished });
      const requestOptions = {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: requestBody,
      };
      const response = await fetch(chekTaskUrl, requestOptions);

      if (response.ok) {
        console.log(`Tarefa marcada como ${finished ? 'Completed' : 'Not Completed'}.`);
      } else {
        console.error('Error: Mark Task', response.statusText);
      }
    } catch (error) {
      console.error('Error: Process Task', response.statusText);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ width: '10%' }} />
        <Text style={styles.title}>Tarefas</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.textLogout}>Sair</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        style={styles.list}
        keyExtractor={({ id }) => id}
        renderItem={({ item }) =>
          <Task
            task={item}
            onDeleteTask={() => handleDeleteTask(item.id)}
            onCheckTask={() => handleCheckTask(item.id, !item.finished)}
          />
        }
      />
      <View style={styles.form}>
        <View style={styles.line} />
        <Input
          value={title}
          onChangeText={(text) => setTitle(text)}
          placeholder="Insira uma nova tarefa"
        />
        <Button
          loading={loading}
          onPress={handleCreateTask}
          title="Adicionar"
          disabled={disabledButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: '#1a1a1a',
    padding: 24,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 30,
  },
  textLogout: {
    color: '#ababab',
    fontSize: 16,
    textDecorationLine: 'underline'
  },
  list: {
    width: '100%',
  },
  line: {
    backgroundColor: '#fff',
    height: 2,
    width: '100%',
    marginBottom: 10,
  },
  form: {
    width: '100%',
    alignItems: 'center'
  },
});
