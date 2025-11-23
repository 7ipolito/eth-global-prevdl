'use client';

import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import { useState } from 'react';

export const UserForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    location: '',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // You can add your form submission logic here
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-4 p-6"
    >
      <h2 className="text-2xl font-bold mb-6">User Information</h2>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium mb-2"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your name"
        />
      </div>

      <div>
        <label
          htmlFor="age"
          className="block text-sm font-medium mb-2"
        >
          Age
        </label>
        <input
          type="number"
          id="age"
          name="age"
          value={formData.age}
          onChange={handleChange}
          required
          min="1"
          max="120"
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your age"
        />
      </div>

      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium mb-2"
        >
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your location"
        />
      </div>

      <Button
        type="submit"
        size="lg"
        variant="secondary"
        className="w-full mt-6"
      >
        Submit
      </Button>
    </form>
  );
};

