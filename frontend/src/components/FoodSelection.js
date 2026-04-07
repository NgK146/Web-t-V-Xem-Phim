import React, { useState, useEffect } from 'react';
import { foodsApi } from '../api/foods.api';
import './FoodSelection.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

const FoodSelection = ({ selectedFoods, onChange }) => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    foodsApi.getActive().then(res => {
      setFoods(res.data.data);
    }).catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, []);

  const getQuantity = (foodId) => {
    const item = selectedFoods.find(f => f.foodId === foodId);
    return item ? item.quantity : 0;
  };

  const updateQuantity = (foodId, delta) => {
    let current = getQuantity(foodId);
    let next = current + delta;
    if (next < 0) next = 0;
    if (next > 10) next = 10; // Max 10 per item

    const newArr = [...selectedFoods];
    const idx = newArr.findIndex(f => f.foodId === foodId);
    
    if (idx !== -1) {
      if (next === 0) {
        newArr.splice(idx, 1);
      } else {
        newArr[idx].quantity = next;
      }
    } else if (next > 0) {
      const food = foods.find(f => f._id === foodId);
      newArr.push({ foodId, quantity: next, price: food ? food.price : 0 });
    }

    onChange(newArr);
  };

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>Đang tải thực đơn...</div>;
  }

  if (foods.length === 0) {
    return <div style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>Chưa có món ăn nào trong thực đơn.</div>;
  }

  // Group by type for better UI
  const combos = foods.filter(f => f.type === 'combo');
  const snacks = foods.filter(f => f.type === 'snack');
  const drinks = foods.filter(f => f.type === 'drink');

  const renderSection = (title, items) => {
    if (!items.length) return null;
    return (
      <div className="fs-section">
        <h3 className="fs-section-title">{title}</h3>
        <div className="fs-grid">
          {items.map(f => {
            const qty = getQuantity(f._id);
            return (
              <div key={f._id} className={`fs-card ${qty > 0 ? 'fs-card-active' : ''}`}>
                <div className="fs-img-wrap">
                  {f.image ? (
                    <img src={f.image.startsWith('http') ? f.image : `${BACKEND_URL}${f.image}`} alt={f.name} />
                  ) : (
                    <div className="fs-img-placeholder">🍿</div>
                  )}
                </div>
                <div className="fs-info">
                  <h4>{f.name}</h4>
                  <p>{f.description}</p>
                  <div className="fs-bottom">
                    <span className="fs-price">{f.price.toLocaleString()} đ</span>
                    <div className="fs-controls">
                      <button onClick={() => updateQuantity(f._id, -1)} disabled={qty === 0}>-</button>
                      <span>{qty}</span>
                      <button onClick={() => updateQuantity(f._id, 1)} className={qty > 0 ? 'active' : ''}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fs-container">
      {renderSection('🔥 Combos Siêu Ưu Đãi', combos)}
      {renderSection('🍿 Bắp & Đồ Ăn Vặt', snacks)}
      {renderSection('🥤 Nước Giải Khát', drinks)}
    </div>
  );
};

export default FoodSelection;
