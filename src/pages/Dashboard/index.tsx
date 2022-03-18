import { useCallback, useEffect, useState } from 'react';

import Header from '../../components/Header';
import api from '../../services/api';
import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';

interface FoodProps {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  image: string;
}

type DashboardProps = {
  foods: FoodProps[];
  editingFood: FoodProps;
  modalOpen: boolean;
  editModalOpen: boolean;
}

function Dashboard() {
  const [state, setState] = useState<DashboardProps>({
    foods: [],
    editingFood: {id:0, name:'', description:'', price:0.0, available: false, image:''},
    modalOpen: false,
    editModalOpen: false,
  })
  const { modalOpen, editModalOpen, editingFood, foods } = state;
  console.log("modalOpen", modalOpen);
  
  const getFoods = useCallback(async () => {
    const response = await api.get('/foods');
    setState({ ...state, foods: response.data })    
  },[]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { 
    getFoods()
  }, [getFoods])

  const handleAddFood = async (food: FoodProps) => {        
    try {
      const response = await api.post('/foods', {
        ...food,
        available: true,
      });

      setState({ ...state, foods: [...foods, response.data], modalOpen: false});
    
    } catch (err) {
      console.log(err);
    }
  }

  const handleUpdateFood = async (food: FoodProps) => {
    console.log(food)
    try {
      const foodUpdated = await api.put(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );

      const foodsUpdated = foods.map(f =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data,
      );

      setState({ ...state, foods: foodsUpdated, editModalOpen: false });      
      
    } catch (err) {
      console.log(err);
    }
  }

  const handleDeleteFood = async (id: number) => {
    await api.delete(`/foods/${id}`);

    const foodsFiltered = foods.filter(food => food.id !== id);

    setState({ ...state, foods: foodsFiltered });
  }

  const toggleModal = () => {
    const { modalOpen } = state;    
    console.log("toggleModal", modalOpen);
    
    setState({...state,  modalOpen: !modalOpen });
  }

  const toggleEditModal = () => {    
    setState({ ...state, editModalOpen: !editModalOpen });
  }

  const handleEditFood = (food: FoodProps) => {
    console.log("handle edit",food);
    
    setState({ ...state, editingFood: food, editModalOpen: true });
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
