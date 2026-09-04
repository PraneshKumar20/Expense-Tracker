import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

const Signup = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const submitHandler = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axios.post("/auth/signup", { name, email, password });
            const userData = response.data?.user || { name, email };
            localStorage.setItem("user", JSON.stringify(userData));
            navigate("/expenses");
        } catch (error) {
            setError(error.response?.data?.message || "Signup failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#030712] p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#030712] to-[#030712]" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <Card className="w-full max-w-md relative z-10 bg-slate-900/80 border-slate-800 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                <CardHeader className="space-y-2 text-center pb-4">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto mb-1">
                        <span className="text-2xl font-black tracking-wider">🚀</span>
                    </div>
                    <CardTitle className="text-3xl font-extrabold tracking-tight text-white">Create Account</CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                        Start managing your wealth, envelopes, and bills today
                    </CardDescription>
                </CardHeader>
                <form onSubmit={submitHandler}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 text-xs font-medium text-rose-300 bg-rose-500/10 rounded-xl border border-rose-500/30">
                                {error}
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs text-slate-300">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Alex Mercer"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="bg-slate-800/80 border-slate-700/80 text-white text-xs placeholder:text-slate-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs text-slate-300">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="alex@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-slate-800/80 border-slate-700/80 text-white text-xs placeholder:text-slate-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs text-slate-300">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-slate-800/80 border-slate-700/80 text-white text-xs placeholder:text-slate-500"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 pt-2">
                        <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-500/25">
                            Complete Registration
                        </Button>
                        <div className="text-center text-xs text-slate-400">
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4 transition-colors"
                            >
                                Sign in
                            </button>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Signup;