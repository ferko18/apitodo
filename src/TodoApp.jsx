import {
  Button,
  Container,
  Paper,
  styled,
  TextField,
  Typography,
  Box,
  List,
  ListItem,
  Checkbox,
  IconButton,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";

import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  border: `solid ${theme.palette.divider} 1px`,
}));
const API_BASE_URL = "https://jsonplaceholder.typicode.com/";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);
  const [editDialog, setEditDialog] = useState({
    open: false,
    value: "",
    todo: null,
  });

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await api.get("/todos", { params: { _limit: 6 } });
      setTodos(response.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    try {
      const response = await api.post("/todos", {
        title: newTodo,
        userId: 1,
        completed: false,
      });

      setTodos([...todos, response.data]);
      setNewTodo("");
    } catch (error) {}
  };

  const deleteTodo = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      const newList = todos.filter((todo) => todo.id !== id);
      setTodos(newList);
    } catch (error) {}
  };

  const toggleCompleted = async (id) => {
    try {
      const toggledObject = todos.find((todo) => todo.id === id);
      const updatedObject = {
        ...toggledObject,
        completed: !toggledObject.completed,
      };
      const response = await api.put(`/todos/${id}`, updatedObject);
      const newArray = todos.map((todo) =>
        todo.id === id ? response.data : todo
      );
      setTodos(newArray);
    } catch (error) {}
  };

  const handleEditClick = (todo) => {
    setEditDialog({
      open: true,
      todo,
      value: todo.title,
    });
  };

  const handleEditClose = () => {
    setEditDialog({
      open: false,
      todo: null,
      value: "",
    });
  };

  const handleEditSave = async () => {
    if (!editDialog.value.trim() || !editDialog.todo) return;
    try {
      const response = await api.put(`/todos/${editDialog.todo.id}`, {
        ...editDialog.todo,
        title: editDialog.value,
      });
      const newArray = todos.map((todo) =>
        todo.id === editDialog.todo.id ? response.data : todo
      );
      setTodos(newArray);
      handleEditClose();
    } catch (error) {}
  };
  return loading ? (
    <CircularProgress />
  ) : (
    <Container maxWidth="md">
      <StyledPaper elevation={3}>
        <Typography variant="h4" gutterBottom>
          To Do App With Api
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Add New Todo"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
          <Button onClick={addTodo} variant="contained">
            Add
          </Button>
        </Box>
        <List>
          {todos.map((todo) => (
            <StyledListItem
              key={todo.id}
              secondaryAction={
                <Box>
                  <IconButton onClick={() => handleEditClick(todo)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => deleteTodo(todo.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <Checkbox
                checked={todo.completed}
                onChange={() => toggleCompleted(todo.id)}
              />
              <Typography
                sx={{
                  ml: 2,
                  textDecoration: todo.completed ? "line-through" : "none",
                  color: todo.completed ? "text.secondary" : "text.primary",
                  mr: 6,
                }}
              >
                {todo.title}
              </Typography>
            </StyledListItem>
          ))}
        </List>
      </StyledPaper>
      <Dialog
        fullWidth
        maxWidth="sm"
        open={editDialog.open}
        onClose={handleEditClose}
      >
        <DialogTitle>Edit Todo</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            value={editDialog.value}
            onChange={(e) =>
              setEditDialog({ ...editDialog, value: e.target.value })
            }
          />
          <DialogActions>
            <Button onClick={handleEditClose}>Cancel</Button>
            <Button onClick={handleEditSave}>Save</Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default TodoApp;
