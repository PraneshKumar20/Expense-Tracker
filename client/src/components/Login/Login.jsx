import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const submitHandler = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axios.post("/auth/login", { email, password });
            const userData = response.data?.user || {
                name: email.split('@')[0],
                email: email
            };
            localStorage.setItem("user", JSON.stringify(userData));
            navigate("/expenses");
        } catch (error) {
            setError(error.response?.data?.message || "Login failed. Please check your credentials.");
        }
    };

    const handleGuestLogin = () => {
        localStorage.setItem("user", JSON.stringify({
            name: "Demo Explorer",
            email: "demo@expensetracker.io",
            isGuest: true
        }));
        navigate("/expenses");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#090d16] p-4">
            <Card className="w-full max-w-md bg-[#0f1523] border border-slate-800 rounded-lg shadow-2xl">
                <CardHeader className="space-y-2 text-center pb-4">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-indigo-600 text-white mx-auto mb-1">
                        <span className="text-lg font-bold tracking-wider">LF</span>
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight text-white">Sign in to LedgerFlow</CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                        Access your wealth analytics, category envelopes, and financial command
                    </CardDescription>
                </CardHeader>
                <form onSubmit={submitHandler}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 text-xs font-medium text-rose-400 bg-rose-500/10 rounded-md border border-rose-500/20">
                                {error}
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs text-slate-300 font-medium">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-slate-900 border-slate-700 text-white text-xs placeholder:text-slate-500 rounded-md focus:border-indigo-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs text-slate-300 font-medium">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-slate-900 border-slate-700 text-white text-xs placeholder:text-slate-500 rounded-md focus:border-indigo-500"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-3 pt-2">
                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-md transition-colors">
                            Sign In
                        </Button>

                        <div className="relative w-full py-1">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-800"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase">
                                <span className="bg-[#0f1523] px-2 text-slate-500 font-mono-nums">Or explore instantly</span>
                            </div>
                        </div>

                        <Button 
                            type="button" 
                            onClick={handleGuestLogin}
                            variant="outline" 
                            className="w-full border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium rounded-md transition-colors"
                        >
                            Continue as Demo Guest
                        </Button>

                        <div className="text-center text-xs text-slate-400 pt-2">
                            Don't have an account?{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/signup")}
                                className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4 transition-colors"
                            >
                                Sign up
                            </button>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Login;