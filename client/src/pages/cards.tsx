import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { HabitWithCards, InsertRfidCard, InsertHabit } from "@shared/schema";
import GlassCard from "@/components/glass-card";
import CardManagerItem from "@/components/card-manager-item";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const cardFormSchema = z.object({
  cardId: z.string().min(1, "Card ID is required"),
  habitId: z.number().min(1, "Please select a habit"),
});

const habitFormSchema = z.object({
  name: z.string().min(1, "Habit name is required"),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().min(1, "Color is required"),
  dailyGoalMinutes: z.number().min(0, "Goal must be positive"),
  checkoutEnabled: z.boolean(),
});

type CardFormValues = z.infer<typeof cardFormSchema>;
type HabitFormValues = z.infer<typeof habitFormSchema>;

export default function Cards() {
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [isHabitDialogOpen, setIsHabitDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: habits = [], isLoading } = useQuery<HabitWithCards[]>({
    queryKey: ['/api/habits']
  });

  const cardForm = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      cardId: "",
      habitId: 0,
    },
  });

  const habitForm = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      name: "",
      icon: "fas fa-circle",
      color: "#007AFF",
      dailyGoalMinutes: 60,
      checkoutEnabled: true,
    },
  });

  const createCardMutation = useMutation({
    mutationFn: async (data: CardFormValues) => {
      const response = await apiRequest('POST', '/api/cards', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      setIsCardDialogOpen(false);
      cardForm.reset();
      toast({
        title: "Success",
        description: "RFID card created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create RFID card",
        variant: "destructive",
      });
    },
  });

  const createHabitMutation = useMutation({
    mutationFn: async (data: HabitFormValues) => {
      const response = await apiRequest('POST', '/api/habits', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      setIsHabitDialogOpen(false);
      habitForm.reset();
      toast({
        title: "Success",
        description: "Habit created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create habit",
        variant: "destructive",
      });
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: number) => {
      await apiRequest('DELETE', `/api/cards/${cardId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      toast({
        title: "Success",
        description: "RFID card deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete RFID card",
        variant: "destructive",
      });
    },
  });

  const onSubmitCard = (data: CardFormValues) => {
    createCardMutation.mutate(data);
  };

  const onSubmitHabit = (data: HabitFormValues) => {
    createHabitMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="px-4 pt-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-white/10 rounded-2xl"></div>
          <div className="h-16 bg-white/10 rounded-xl"></div>
          <div className="h-16 bg-white/10 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const allCards = habits.flatMap(habit => 
    habit.cards.map(card => ({ ...card, habitName: habit.name, habitIcon: habit.icon, habitColor: habit.color }))
  );

  return (
    <div className="px-4 pt-8">
      {/* Add New Habit Button */}
      <div className="mb-6">
        <Dialog open={isHabitDialogOpen} onOpenChange={setIsHabitDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full glass-strong rounded-xl py-3 text-sm border-0 hover:bg-white/20">
              <i className="fas fa-plus mr-2"></i>
              Add New Habit
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black/90 backdrop-blur-xl border border-white/20">
            <DialogHeader>
              <DialogTitle>Create New Habit</DialogTitle>
            </DialogHeader>
            <Form {...habitForm}>
              <form onSubmit={habitForm.handleSubmit(onSubmitHabit)} className="space-y-4">
                <FormField
                  control={habitForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Habit Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Study, Exercise, Water"
                          className="bg-white/10 border-white/20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={habitForm.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon Class</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., fas fa-book, fas fa-dumbbell"
                          className="bg-white/10 border-white/20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={habitForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input 
                          type="color"
                          className="bg-white/10 border-white/20 h-12"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={habitForm.control}
                  name="dailyGoalMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Goal (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="60"
                          className="bg-white/10 border-white/20"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsHabitDialogOpen(false)}
                    className="flex-1 border-white/20 bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-ios-blue hover:bg-ios-blue/80"
                    disabled={createHabitMutation.isPending}
                  >
                    {createHabitMutation.isPending ? "Creating..." : "Create Habit"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* RFID Cards List */}
      <GlassCard className="rounded-2xl p-5 mb-6">
        <h3 className="font-medium mb-4 text-lg">RFID Cards</h3>
        <div className="space-y-3">
          {allCards.map((card) => (
            <CardManagerItem
              key={card.id}
              card={card}
              onDelete={() => deleteCardMutation.mutate(card.id)}
            />
          ))}
          {allCards.length === 0 && (
            <p className="text-white/50 text-sm text-center py-4">
              No RFID cards configured yet
            </p>
          )}
        </div>
      </GlassCard>

      {/* Floating Add Card Button */}
      <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
        <DialogTrigger asChild>
          <Button className="fixed bottom-24 right-6 w-14 h-14 bg-ios-blue rounded-full p-0 glow-blue shadow-lg hover:bg-ios-blue/80">
            <i className="fas fa-plus text-xl"></i>
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-black/90 backdrop-blur-xl border border-white/20">
          <DialogHeader>
            <DialogTitle>Add RFID Card</DialogTitle>
          </DialogHeader>
          <Form {...cardForm}>
            <form onSubmit={cardForm.handleSubmit(onSubmitCard)} className="space-y-4">
              <FormField
                control={cardForm.control}
                name="cardId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., A1B2C3D4"
                        className="bg-white/10 border-white/20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={cardForm.control}
                name="habitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to Habit</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/10 border-white/20">
                          <SelectValue placeholder="Select a habit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-black/90 backdrop-blur-xl border border-white/20">
                        {habits.map((habit) => (
                          <SelectItem key={habit.id} value={habit.id.toString()}>
                            <div className="flex items-center space-x-2">
                              <i className={`${habit.icon} text-sm`} style={{ color: habit.color }}></i>
                              <span>{habit.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCardDialogOpen(false)}
                  className="flex-1 border-white/20 bg-transparent"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-ios-blue hover:bg-ios-blue/80"
                  disabled={createCardMutation.isPending}
                >
                  {createCardMutation.isPending ? "Adding..." : "Add Card"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
